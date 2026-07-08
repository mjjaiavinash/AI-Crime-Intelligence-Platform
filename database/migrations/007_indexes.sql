-- =============================================================================
-- Migration 007 — Performance Indexes
-- Run after all table migrations (001–006)
-- Covers: lookup, filter, sort, geo, and full-text search patterns
-- =============================================================================

-- ── districts ────────────────────────────────────────────────────────────────
CREATE INDEX  idx_districts_state
    ON districts (state);

-- ── police_stations ───────────────────────────────────────────────────────────
CREATE INDEX  idx_ps_district
    ON police_stations (district_id);

CREATE INDEX  idx_ps_geo
    ON police_stations (latitude, longitude);

-- ── users ─────────────────────────────────────────────────────────────────────
CREATE INDEX  idx_users_role
    ON users (role_id);

CREATE INDEX  idx_users_active
    ON users (is_active);

-- ── officers ──────────────────────────────────────────────────────────────────
CREATE INDEX  idx_officers_station
    ON officers (station_id);

CREATE INDEX  idx_officers_district
    ON officers (district_id);

CREATE INDEX idx_officers_rank
    ON officers (`rank`);

-- ── crime_types ───────────────────────────────────────────────────────────────
CREATE INDEX  idx_ct_category
    ON crime_types (category);

CREATE INDEX  idx_ct_severity
    ON crime_types (severity);

-- ── fir ───────────────────────────────────────────────────────────────────────
CREATE INDEX  idx_fir_station
    ON fir (station_id);

CREATE INDEX  idx_fir_district
    ON fir (district_id);

CREATE INDEX  idx_fir_crime_type
    ON fir (crime_type_id);

CREATE INDEX  idx_fir_status
    ON fir (status);

CREATE INDEX  idx_fir_incident_date
    ON fir (incident_date);

CREATE INDEX  idx_fir_reported_date
    ON fir (reported_date);

CREATE INDEX  idx_fir_io_officer
    ON fir (io_officer_id);

-- Geo index for map hotspot queries
CREATE INDEX  idx_fir_geo
    ON fir (latitude, longitude);

-- Composite: status + date — used by dashboard "open cases this month"
CREATE INDEX  idx_fir_status_date
    ON fir (status, incident_date);

-- Full-text search on FIR title and description
ALTER TABLE fir
    ADD FULLTEXT INDEX  ft_fir_search (title, description);

-- ── victims ───────────────────────────────────────────────────────────────────
CREATE INDEX  idx_victims_fir
    ON victims (fir_id);

CREATE INDEX  idx_victims_name
    ON victims (full_name);

CREATE INDEX  idx_victims_district
    ON victims (district_id);

CREATE INDEX  idx_victims_injury
    ON victims (injury_type);

-- ── suspects ──────────────────────────────────────────────────────────────────
CREATE INDEX  idx_suspects_name
    ON suspects (full_name);

CREATE INDEX  idx_suspects_arrest_status
    ON suspects (arrest_status);

CREATE INDEX  idx_suspects_threat
    ON suspects (threat_level);

CREATE INDEX  idx_suspects_district
    ON suspects (district_id);

CREATE INDEX  idx_suspects_known_criminal
    ON suspects (is_known_criminal);

-- Full-text search on suspect name, alias, distinguishing marks
ALTER TABLE suspects
    ADD FULLTEXT INDEX  ft_suspects_search (full_name, alias, distinguishing_marks);

-- ── suspect_fir ───────────────────────────────────────────────────────────────
CREATE INDEX  idx_sf_fir
    ON suspect_fir (fir_id);

-- ── crime_history ─────────────────────────────────────────────────────────────
CREATE INDEX  idx_ch_suspect
    ON crime_history (suspect_id);

CREATE INDEX  idx_ch_crime_type
    ON crime_history (crime_type_id);

CREATE INDEX  idx_ch_outcome
    ON crime_history (outcome);

CREATE INDEX  idx_ch_incident_date
    ON crime_history (incident_date);

-- ── vehicles ──────────────────────────────────────────────────────────────────
CREATE INDEX  idx_vehicles_suspect
    ON vehicles (suspect_id);

CREATE INDEX  idx_vehicles_fir
    ON vehicles (fir_id);

CREATE INDEX  idx_vehicles_reg
    ON vehicles (registration_number);

CREATE INDEX  idx_vehicles_status
    ON vehicles (status);

-- ── bank_accounts ─────────────────────────────────────────────────────────────
CREATE INDEX  idx_ba_suspect
    ON bank_accounts (suspect_id);

CREATE INDEX  idx_ba_fir
    ON bank_accounts (fir_id);

CREATE INDEX  idx_ba_freeze_status
    ON bank_accounts (freeze_status);

CREATE INDEX  idx_ba_bank_name
    ON bank_accounts (bank_name);

-- ── mobile_numbers ────────────────────────────────────────────────────────────
CREATE INDEX  idx_mn_suspect
    ON mobile_numbers (suspect_id);

CREATE INDEX  idx_mn_fir
    ON mobile_numbers (fir_id);

CREATE INDEX  idx_mn_number
    ON mobile_numbers (mobile_number);

CREATE INDEX  idx_mn_imei
    ON mobile_numbers (imei_number);

CREATE INDEX  idx_mn_surveillance
    ON mobile_numbers (surveillance_flag);

-- ── evidence ──────────────────────────────────────────────────────────────────
CREATE INDEX  idx_evidence_fir
    ON evidence (fir_id);

CREATE INDEX  idx_evidence_type
    ON evidence (evidence_type);

CREATE INDEX  idx_evidence_status
    ON evidence (status);

CREATE INDEX  idx_evidence_officer
    ON evidence (collected_by);

-- ── investigation ─────────────────────────────────────────────────────────────
CREATE INDEX  idx_inv_lead_officer
    ON investigation (lead_officer_id);

CREATE INDEX  idx_inv_status
    ON investigation (status);

CREATE INDEX  idx_inv_start_date
    ON investigation (start_date);

-- ── investigation_notes ───────────────────────────────────────────────────────
CREATE INDEX  idx_in_investigation
    ON investigation_notes (investigation_id);

CREATE INDEX  idx_in_officer
    ON investigation_notes (officer_id);

CREATE INDEX  idx_in_note_type
    ON investigation_notes (note_type);
