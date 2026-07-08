-- =============================================================================
-- Migration 003 — Crime Types & FIR
-- Tables: crime_types, fir
-- Depends on: 001_foundation, 002_users_officers
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- crime_types
-- Normalised lookup for IPC/BNS sections and crime categories
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crime_types (
    id              SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    category        VARCHAR(100)        NOT NULL COMMENT 'e.g. Violent, Property, Cyber, Financial',
    name            VARCHAR(150)        NOT NULL COMMENT 'e.g. Robbery, Theft, Fraud',
    ipc_section     VARCHAR(50)         NULL     COMMENT 'Indian Penal Code / BNS section number',
    bns_section     VARCHAR(50)         NULL     COMMENT 'Bharatiya Nyaya Sanhita section (2023)',
    description     TEXT                NULL,
    severity        ENUM(
                        'petty',
                        'minor',
                        'moderate',
                        'serious',
                        'heinous'
                    )                   NOT NULL DEFAULT 'moderate',
    is_cognizable   TINYINT(1)          NOT NULL DEFAULT 1  COMMENT '1 = police can arrest without warrant',
    is_bailable     TINYINT(1)          NOT NULL DEFAULT 0,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_crime_types PRIMARY KEY (id),
    CONSTRAINT uq_crime_types_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Normalised crime type / IPC section lookup';


-- -----------------------------------------------------------------------------
-- fir
-- First Information Report — central hub of the entire schema
-- Every victim, suspect, evidence, investigation record links back here
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fir (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,

    -- Identifiers
    fir_number          VARCHAR(50)         NOT NULL COMMENT 'Official FIR number e.g. FIR/2024/001',
    station_id          INT UNSIGNED        NOT NULL COMMENT 'Filing station',
    district_id         SMALLINT UNSIGNED   NOT NULL COMMENT 'Jurisdiction district',
    crime_type_id       SMALLINT UNSIGNED   NOT NULL COMMENT 'Primary crime type',

    -- Officers
    io_officer_id       INT UNSIGNED        NULL     COMMENT 'Investigating Officer',
    filed_by_officer_id INT UNSIGNED        NULL     COMMENT 'Officer who filed the FIR',

    -- Incident details
    title               VARCHAR(255)        NOT NULL,
    description         TEXT                NULL,
    incident_date       DATETIME            NOT NULL COMMENT 'When the crime occurred',
    reported_date       DATETIME            NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'When FIR was filed',
    location_name       VARCHAR(255)        NULL,
    latitude            DECIMAL(10,8)       NULL,
    longitude           DECIMAL(11,8)       NULL,
    address             VARCHAR(500)        NULL,

    -- Status lifecycle
    status              ENUM(
                            'filed',
                            'under_investigation',
                            'charge_sheet_filed',
                            'closed_true',
                            'closed_false',
                            'referred_to_court'
                        )                   NOT NULL DEFAULT 'filed',

    -- Court / legal
    court_name          VARCHAR(200)        NULL,
    court_case_number   VARCHAR(100)        NULL,
    next_hearing_date   DATE                NULL,

    -- Metadata
    is_sensitive        TINYINT(1)          NOT NULL DEFAULT 0 COMMENT 'Restricted access flag',
    created_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_fir PRIMARY KEY (id),
    CONSTRAINT uq_fir_number UNIQUE (fir_number),

    CONSTRAINT fk_fir_station
        FOREIGN KEY (station_id)          REFERENCES police_stations (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_fir_district
        FOREIGN KEY (district_id)         REFERENCES districts        (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_fir_crime_type
        FOREIGN KEY (crime_type_id)       REFERENCES crime_types      (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_fir_io_officer
        FOREIGN KEY (io_officer_id)       REFERENCES officers         (id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_fir_filed_by
        FOREIGN KEY (filed_by_officer_id) REFERENCES officers         (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='First Information Report — central hub table';


-- -----------------------------------------------------------------------------
-- fir_crime_types
-- Junction: one FIR can involve multiple crime types (e.g. robbery + assault)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS fir_crime_types (
    fir_id          INT UNSIGNED        NOT NULL,
    crime_type_id   SMALLINT UNSIGNED   NOT NULL,
    is_primary      TINYINT(1)          NOT NULL DEFAULT 0,
    added_at        TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_fir_crime_types PRIMARY KEY (fir_id, crime_type_id),
    CONSTRAINT fk_fct_fir
        FOREIGN KEY (fir_id)        REFERENCES fir         (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_fct_crime_type
        FOREIGN KEY (crime_type_id) REFERENCES crime_types (id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Many-to-many: FIR ↔ crime types';


SET FOREIGN_KEY_CHECKS = 1;
