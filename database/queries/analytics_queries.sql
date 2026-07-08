-- =============================================================================
-- Analytics Queries — AI Crime Intelligence Platform
-- Used by: backend/services/analytics_service.py
-- All queries are parameterised with :param notation for SQLAlchemy
-- =============================================================================


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1: Dashboard Summary
-- ─────────────────────────────────────────────────────────────────────────────

-- [1.1] Overall case status counts
SELECT
    COUNT(*)                                                        AS total_firs,
    SUM(status IN ('filed','under_investigation'))                  AS active_cases,
    SUM(status IN ('closed_true','closed_false'))                   AS closed_cases,
    SUM(status = 'charge_sheet_filed')                              AS charge_sheet_filed,
    SUM(status = 'referred_to_court')                               AS in_court
FROM fir;


-- [1.2] New FIRs filed in the last 30 days
SELECT COUNT(*) AS new_firs_30d
FROM fir
WHERE reported_date >= DATE_SUB(NOW(), INTERVAL 30 DAY);


-- [1.3] Case clearance rate (closed / total × 100)
SELECT
    ROUND(
        SUM(status IN ('closed_true','closed_false')) * 100.0 / COUNT(*), 2
    ) AS clearance_rate_pct
FROM fir;


-- [1.4] Suspects at large (high threat)
SELECT COUNT(*) AS high_threat_at_large
FROM suspects
WHERE arrest_status = 'at_large' AND threat_level IN ('high','extreme');


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2: Crime Hotspots (Leaflet Heatmap)
-- ─────────────────────────────────────────────────────────────────────────────

-- [2.1] Geo-clustered hotspots (top 30)
SELECT * FROM v_crime_hotspots LIMIT 30;


-- [2.2] Hotspots filtered by crime category
SELECT
    ROUND(f.latitude,  2) AS lat,
    ROUND(f.longitude, 2) AS lng,
    COUNT(*)              AS count
FROM fir f
JOIN crime_types ct ON ct.id = f.crime_type_id
WHERE ct.category = :category          -- e.g. 'Violent', 'Cyber', 'Financial'
  AND f.latitude  IS NOT NULL
GROUP BY ROUND(f.latitude, 2), ROUND(f.longitude, 2)
ORDER BY count DESC
LIMIT 20;


-- [2.3] Hotspots by district
SELECT
    d.name                AS district,
    COUNT(f.id)           AS total_crimes,
    SUM(f.status IN ('filed','under_investigation')) AS open_cases
FROM fir f
JOIN districts d ON d.id = f.district_id
GROUP BY d.id, d.name
ORDER BY total_crimes DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3: Trend Analysis (Recharts)
-- ─────────────────────────────────────────────────────────────────────────────

-- [3.1] Monthly crime trend (all types)
SELECT month, SUM(total) AS total
FROM v_monthly_trends
GROUP BY month
ORDER BY month;


-- [3.2] Monthly trend by crime type
SELECT month, crime_type, total
FROM v_monthly_trends
ORDER BY month, total DESC;


-- [3.3] Year-over-year comparison
SELECT
    YEAR(incident_date)  AS year,
    MONTH(incident_date) AS month,
    COUNT(*)             AS total
FROM fir
GROUP BY YEAR(incident_date), MONTH(incident_date)
ORDER BY year, month;


-- [3.4] Crime count by type (bar chart)
SELECT
    ct.name         AS crime_type,
    ct.category,
    COUNT(f.id)     AS total
FROM fir f
JOIN crime_types ct ON ct.id = f.crime_type_id
GROUP BY ct.id, ct.name, ct.category
ORDER BY total DESC;


-- [3.5] Crime count by severity
SELECT
    ct.severity,
    COUNT(f.id) AS total
FROM fir f
JOIN crime_types ct ON ct.id = f.crime_type_id
GROUP BY ct.severity
ORDER BY FIELD(ct.severity, 'heinous','serious','moderate','minor','petty');


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 4: Suspect Intelligence (Cytoscape Network Graph)
-- ─────────────────────────────────────────────────────────────────────────────

-- [4.1] Full suspect profiles with asset counts
SELECT * FROM v_suspect_profile
ORDER BY total_firs DESC, prior_convictions DESC;


-- [4.2] Suspect network — nodes and edges for Cytoscape
-- Nodes: suspects + FIRs + locations
SELECT
    CONCAT('suspect-', s.id)    AS node_id,
    COALESCE(s.full_name, 'Unknown') AS label,
    'suspect'                   AS node_type,
    s.threat_level,
    s.arrest_status
FROM suspects s
UNION ALL
SELECT
    CONCAT('fir-', f.id),
    f.fir_number,
    'fir',
    f.status,
    NULL
FROM fir f;

-- Edges: suspect → FIR
SELECT
    CONCAT('suspect-', sf.suspect_id) AS source,
    CONCAT('fir-', sf.fir_id)         AS target,
    sf.role_in_case                   AS label
FROM suspect_fir sf;


-- [4.3] Gang / group clustering
SELECT
    gang_affiliation,
    COUNT(*)            AS member_count,
    SUM(is_known_criminal) AS known_criminals,
    GROUP_CONCAT(COALESCE(full_name,'Unknown') ORDER BY full_name SEPARATOR ', ') AS members
FROM suspects
WHERE gang_affiliation IS NOT NULL
GROUP BY gang_affiliation
ORDER BY member_count DESC;


-- [4.4] Repeat offenders (suspects with 2+ FIRs)
SELECT
    s.id,
    s.full_name,
    s.alias,
    s.threat_level,
    COUNT(sf.fir_id)    AS fir_count,
    COUNT(ch.id)        AS prior_convictions
FROM suspects s
JOIN suspect_fir   sf ON sf.suspect_id = s.id
LEFT JOIN crime_history ch ON ch.suspect_id = s.id AND ch.outcome = 'convicted'
GROUP BY s.id, s.full_name, s.alias, s.threat_level
HAVING fir_count >= 2
ORDER BY fir_count DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 5: Officer & Station Performance
-- ─────────────────────────────────────────────────────────────────────────────

-- [5.1] Officer workload
SELECT * FROM v_officer_workload
ORDER BY active_cases DESC;


-- [5.2] Station-wise FIR count
SELECT
    ps.name             AS station,
    d.name              AS district,
    COUNT(f.id)         AS total_firs,
    SUM(f.status IN ('filed','under_investigation')) AS open_cases,
    ROUND(AVG(DATEDIFF(COALESCE(inv.actual_close_date, CURDATE()), f.reported_date)), 1)
                        AS avg_resolution_days
FROM police_stations ps
JOIN districts d ON d.id = ps.district_id
LEFT JOIN fir f  ON f.station_id = ps.id
LEFT JOIN investigation inv ON inv.fir_id = f.id
GROUP BY ps.id, ps.name, d.name
ORDER BY total_firs DESC;


-- [5.3] Overdue investigations
SELECT * FROM v_investigation_status
WHERE is_overdue = 1
ORDER BY days_elapsed DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 6: Financial & Telecom Intelligence
-- ─────────────────────────────────────────────────────────────────────────────

-- [6.1] Frozen bank accounts summary
SELECT
    ba.bank_name,
    COUNT(*)                    AS frozen_accounts,
    SUM(ba.flagged_amount)      AS total_flagged_amount
FROM bank_accounts ba
WHERE ba.freeze_status = 'frozen'
GROUP BY ba.bank_name
ORDER BY total_flagged_amount DESC;


-- [6.2] Mobile numbers under surveillance
SELECT
    mn.mobile_number,
    mn.operator,
    mn.registered_name,
    s.full_name         AS linked_suspect,
    s.threat_level,
    f.fir_number
FROM mobile_numbers mn
LEFT JOIN suspects s ON s.id = mn.suspect_id
LEFT JOIN fir      f ON f.id = mn.fir_id
WHERE mn.surveillance_flag = 1
ORDER BY s.threat_level DESC;


-- [6.3] Vehicles by status
SELECT
    status,
    vehicle_type,
    COUNT(*) AS count
FROM vehicles
GROUP BY status, vehicle_type
ORDER BY status, count DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 7: Evidence Chain of Custody
-- ─────────────────────────────────────────────────────────────────────────────

-- [7.1] Evidence status summary per FIR
SELECT
    f.fir_number,
    f.title,
    COUNT(e.id)                                     AS total_evidence,
    SUM(e.status = 'collected')                     AS collected,
    SUM(e.status = 'submitted_to_lab')              AS in_lab,
    SUM(e.status = 'lab_report_received')           AS report_received,
    SUM(e.status = 'presented_in_court')            AS in_court
FROM fir f
LEFT JOIN evidence e ON e.fir_id = f.id
GROUP BY f.id, f.fir_number, f.title
ORDER BY total_evidence DESC;


-- [7.2] Evidence by type
SELECT
    evidence_type,
    COUNT(*)    AS total,
    SUM(is_tamper_evident) AS tamper_evident_count
FROM evidence
GROUP BY evidence_type
ORDER BY total DESC;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 8: Full-Text Search (RAG ingestion candidates)
-- ─────────────────────────────────────────────────────────────────────────────

-- [8.1] FIR full-text search
SELECT id, fir_number, title, status, incident_date,
       MATCH(title, description) AGAINST (:query IN NATURAL LANGUAGE MODE) AS relevance
FROM fir
WHERE MATCH(title, description) AGAINST (:query IN NATURAL LANGUAGE MODE)
ORDER BY relevance DESC
LIMIT 20;


-- [8.2] Suspect full-text search
SELECT id, full_name, alias, threat_level, arrest_status,
       MATCH(full_name, alias, distinguishing_marks) AGAINST (:query IN NATURAL LANGUAGE MODE) AS relevance
FROM suspects
WHERE MATCH(full_name, alias, distinguishing_marks) AGAINST (:query IN NATURAL LANGUAGE MODE)
ORDER BY relevance DESC
LIMIT 20;
