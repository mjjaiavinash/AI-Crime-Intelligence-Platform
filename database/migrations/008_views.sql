-- =============================================================================
-- Migration 008 — Analytical Views
-- Pre-joined views consumed by the FastAPI analytics service
-- Run after 001–007
-- =============================================================================

-- ── v_fir_full ────────────────────────────────────────────────────────────────
-- Complete FIR record with station, district, crime type, and officer names
CREATE OR REPLACE VIEW v_fir_full AS
SELECT
    f.id                                        AS fir_id,
    f.fir_number,
    f.title,
    f.status,
    f.incident_date,
    f.reported_date,
    f.latitude,
    f.longitude,
    f.location_name,
    f.address,
    f.is_sensitive,

    ct.name                                     AS crime_type,
    ct.category                                 AS crime_category,
    ct.severity                                 AS crime_severity,
    ct.ipc_section,

    ps.name                                     AS station_name,
    ps.station_code,

    d.name                                      AS district_name,
    d.state,

    CONCAT(u_io.full_name, ' (', o_io.badge_number, ')')
                                                AS io_officer,
    o_io.rank                                   AS io_rank

FROM fir f
JOIN crime_types    ct   ON ct.id  = f.crime_type_id
JOIN police_stations ps  ON ps.id  = f.station_id
JOIN districts       d   ON d.id   = f.district_id
LEFT JOIN officers   o_io ON o_io.id = f.io_officer_id
LEFT JOIN users      u_io ON u_io.id = o_io.user_id;


-- ── v_suspect_profile ─────────────────────────────────────────────────────────
-- Suspect with FIR count, crime history count, and linked assets
CREATE OR REPLACE VIEW v_suspect_profile AS
SELECT
    s.id                                        AS suspect_id,
    s.full_name,
    s.alias,
    s.gender,
    s.threat_level,
    s.arrest_status,
    s.is_known_criminal,
    s.gang_affiliation,
    d.name                                      AS district_name,

    COUNT(DISTINCT sf.fir_id)                   AS total_firs,
    COUNT(DISTINCT ch.id)                       AS prior_convictions,
    COUNT(DISTINCT v.id)                        AS linked_vehicles,
    COUNT(DISTINCT ba.id)                       AS linked_bank_accounts,
    COUNT(DISTINCT mn.id)                       AS linked_mobile_numbers

FROM suspects s
LEFT JOIN districts      d   ON d.id  = s.district_id
LEFT JOIN suspect_fir    sf  ON sf.suspect_id = s.id
LEFT JOIN crime_history  ch  ON ch.suspect_id = s.id AND ch.outcome = 'convicted'
LEFT JOIN vehicles       v   ON v.suspect_id  = s.id
LEFT JOIN bank_accounts  ba  ON ba.suspect_id = s.id
LEFT JOIN mobile_numbers mn  ON mn.suspect_id = s.id
GROUP BY s.id, s.full_name, s.alias, s.gender, s.threat_level,
         s.arrest_status, s.is_known_criminal, s.gang_affiliation, d.name;


-- ── v_crime_hotspots ──────────────────────────────────────────────────────────
-- Geo-clustered crime counts for Leaflet heatmap
CREATE OR REPLACE VIEW v_crime_hotspots AS
SELECT
    ROUND(latitude,  2)                         AS lat,
    ROUND(longitude, 2)                         AS lng,
    COUNT(*)                                    AS incident_count,
    GROUP_CONCAT(DISTINCT ct.name ORDER BY ct.name SEPARATOR ', ')
                                                AS crime_types,
    SUM(CASE WHEN f.status = 'open' THEN 1 ELSE 0 END)
                                                AS open_count
FROM fir f
JOIN crime_types ct ON ct.id = f.crime_type_id
WHERE f.latitude IS NOT NULL AND f.longitude IS NOT NULL
GROUP BY ROUND(latitude, 2), ROUND(longitude, 2)
ORDER BY incident_count DESC;


-- ── v_monthly_trends ──────────────────────────────────────────────────────────
-- Monthly crime counts by type — feeds Recharts TrendLineChart
CREATE OR REPLACE VIEW v_monthly_trends AS
SELECT
    DATE_FORMAT(f.incident_date, '%Y-%m')       AS month,
    ct.name                                     AS crime_type,
    ct.category,
    COUNT(*)                                    AS total,
    SUM(CASE WHEN f.status = 'open'             THEN 1 ELSE 0 END) AS open_count,
    SUM(CASE WHEN f.status = 'closed_true'      THEN 1 ELSE 0 END) AS closed_count
FROM fir f
JOIN crime_types ct ON ct.id = f.crime_type_id
WHERE f.incident_date IS NOT NULL
GROUP BY DATE_FORMAT(f.incident_date, '%Y-%m'), ct.name, ct.category
ORDER BY month, total DESC;


-- ── v_officer_workload ────────────────────────────────────────────────────────
-- Per-officer case load — used by admin dashboard
CREATE OR REPLACE VIEW v_officer_workload AS
SELECT
    o.id                                        AS officer_id,
    u.full_name                                 AS officer_name,
    o.badge_number,
    o.rank,
    ps.name                                     AS station_name,
    d.name                                      AS district_name,

    COUNT(DISTINCT f.id)                        AS total_firs,
    SUM(CASE WHEN f.status IN ('filed','under_investigation') THEN 1 ELSE 0 END)
                                                AS active_cases,
    SUM(CASE WHEN f.status IN ('closed_true','closed_false')  THEN 1 ELSE 0 END)
                                                AS closed_cases,
    COUNT(DISTINCT inv.id)                      AS investigations_led

FROM officers o
JOIN users           u   ON u.id  = o.user_id
JOIN police_stations ps  ON ps.id = o.station_id
JOIN districts       d   ON d.id  = o.district_id
LEFT JOIN fir        f   ON f.io_officer_id = o.id
LEFT JOIN investigation inv ON inv.lead_officer_id = o.id
GROUP BY o.id, u.full_name, o.badge_number, o.rank, ps.name, d.name;


-- ── v_investigation_status ────────────────────────────────────────────────────
-- Investigation progress with days elapsed and overdue flag
CREATE OR REPLACE VIEW v_investigation_status AS
SELECT
    inv.id                                      AS investigation_id,
    f.fir_number,
    f.title                                     AS fir_title,
    inv.status,
    inv.outcome,
    inv.start_date,
    inv.target_close_date,
    DATEDIFF(CURDATE(), inv.start_date)         AS days_elapsed,
    CASE
        WHEN inv.target_close_date IS NOT NULL
         AND inv.actual_close_date IS NULL
         AND CURDATE() > inv.target_close_date  THEN 1
        ELSE 0
    END                                         AS is_overdue,
    u.full_name                                 AS lead_officer_name,
    o.badge_number,
    COUNT(DISTINCT io.officer_id)               AS team_size,
    COUNT(DISTINCT n.id)                        AS note_count
FROM investigation inv
JOIN fir                    f   ON f.id   = inv.fir_id
LEFT JOIN officers          o   ON o.id   = inv.lead_officer_id
LEFT JOIN users             u   ON u.id   = o.user_id
LEFT JOIN investigation_officers io ON io.investigation_id = inv.id
LEFT JOIN investigation_notes    n  ON n.investigation_id  = inv.id
GROUP BY inv.id, f.fir_number, f.title, inv.status, inv.outcome,
         inv.start_date, inv.target_close_date, inv.actual_close_date,
         u.full_name, o.badge_number;
