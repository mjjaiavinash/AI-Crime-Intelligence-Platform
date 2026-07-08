-- =============================================================================
-- Migration 006 — Evidence & Investigation
-- Tables: evidence, investigation, investigation_officers, investigation_notes
-- Depends on: 003_crime_types_fir, 002_users_officers
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- evidence
-- Physical and digital evidence items linked to a FIR
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evidence (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    fir_id              INT UNSIGNED        NOT NULL,
    collected_by        INT UNSIGNED        NULL     COMMENT 'FK → officers.id',

    -- Classification
    evidence_type       ENUM(
                            'physical',
                            'digital',
                            'documentary',
                            'forensic',
                            'witness_statement',
                            'cctv_footage',
                            'audio',
                            'photograph',
                            'other'
                        )                   NOT NULL DEFAULT 'physical',
    title               VARCHAR(255)        NOT NULL,
    description         TEXT                NULL,

    -- File storage
    file_path           VARCHAR(500)        NULL     COMMENT 'Relative path in /uploads/evidence/',
    file_name           VARCHAR(255)        NULL,
    file_type           VARCHAR(50)         NULL     COMMENT 'MIME type',
    file_size_kb        INT UNSIGNED        NULL,
    checksum_sha256     VARCHAR(64)         NULL     COMMENT 'Integrity hash',

    -- Chain of custody
    collection_date     DATETIME            NULL,
    collection_location VARCHAR(255)        NULL,
    lab_reference       VARCHAR(100)        NULL     COMMENT 'Forensic lab case number',
    lab_report_path     VARCHAR(500)        NULL,

    -- Status
    status              ENUM(
                            'collected',
                            'submitted_to_lab',
                            'lab_report_received',
                            'presented_in_court',
                            'disposed'
                        )                   NOT NULL DEFAULT 'collected',
    is_tamper_evident   TINYINT(1)          NOT NULL DEFAULT 0,

    created_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_evidence PRIMARY KEY (id),
    CONSTRAINT fk_evidence_fir
        FOREIGN KEY (fir_id)        REFERENCES fir      (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_evidence_officer
        FOREIGN KEY (collected_by)  REFERENCES officers (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Evidence items linked to FIR records';


-- -----------------------------------------------------------------------------
-- investigation
-- Investigation case record — tracks the lifecycle of a FIR investigation
-- One FIR has one investigation record
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS investigation (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    fir_id              INT UNSIGNED        NOT NULL,
    lead_officer_id     INT UNSIGNED        NULL     COMMENT 'Lead investigating officer',

    -- Timeline
    start_date          DATE                NOT NULL,
    target_close_date   DATE                NULL,
    actual_close_date   DATE                NULL,

    -- Status
    status              ENUM(
                            'initiated',
                            'active',
                            'pending_arrest',
                            'pending_lab',
                            'pending_court',
                            'charge_sheet_ready',
                            'closed'
                        )                   NOT NULL DEFAULT 'initiated',

    -- Outcome
    outcome             ENUM(
                            'pending',
                            'charge_sheet_filed',
                            'final_report_true',
                            'final_report_false',
                            'referred'
                        )                   NOT NULL DEFAULT 'pending',
    outcome_summary     TEXT                NULL,

    -- Supervision
    supervisor_id       INT UNSIGNED        NULL     COMMENT 'Supervising officer / SP / DCP',
    reviewed_at         TIMESTAMP           NULL,

    created_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_investigation PRIMARY KEY (id),
    CONSTRAINT uq_investigation_fir UNIQUE (fir_id),
    CONSTRAINT fk_inv_fir
        FOREIGN KEY (fir_id)          REFERENCES fir      (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_inv_lead_officer
        FOREIGN KEY (lead_officer_id) REFERENCES officers (id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_inv_supervisor
        FOREIGN KEY (supervisor_id)   REFERENCES officers (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Investigation lifecycle record for each FIR';


-- -----------------------------------------------------------------------------
-- investigation_officers
-- Junction: multiple officers can be assigned to one investigation
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS investigation_officers (
    investigation_id    INT UNSIGNED        NOT NULL,
    officer_id          INT UNSIGNED        NOT NULL,
    role                VARCHAR(100)        NULL     COMMENT 'e.g. IO, Forensic Expert, Translator',
    assigned_at         TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    relieved_at         TIMESTAMP           NULL,

    CONSTRAINT pk_inv_officers PRIMARY KEY (investigation_id, officer_id),
    CONSTRAINT fk_io_investigation
        FOREIGN KEY (investigation_id) REFERENCES investigation (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_io_officer
        FOREIGN KEY (officer_id)       REFERENCES officers      (id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Officers assigned to an investigation';


-- -----------------------------------------------------------------------------
-- investigation_notes
-- Timestamped notes / diary entries added by officers during investigation
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS investigation_notes (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    investigation_id    INT UNSIGNED        NOT NULL,
    officer_id          INT UNSIGNED        NULL,
    note                TEXT                NOT NULL,
    note_type           ENUM(
                            'general',
                            'lead',
                            'witness_interview',
                            'site_visit',
                            'lab_update',
                            'court_update',
                            'arrest_update'
                        )                   NOT NULL DEFAULT 'general',
    is_confidential     TINYINT(1)          NOT NULL DEFAULT 0,
    created_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_inv_notes PRIMARY KEY (id),
    CONSTRAINT fk_in_investigation
        FOREIGN KEY (investigation_id) REFERENCES investigation (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_in_officer
        FOREIGN KEY (officer_id)       REFERENCES officers      (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Investigation diary / notes log';


SET FOREIGN_KEY_CHECKS = 1;
