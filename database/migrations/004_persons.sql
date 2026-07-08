-- =============================================================================
-- Migration 004 — Persons: Victims, Suspects, Crime History
-- Tables: victims, suspects, crime_history
-- Depends on: 003_crime_types_fir
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- victims
-- Persons who are victims in a FIR
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS victims (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    fir_id              INT UNSIGNED        NOT NULL,

    -- Identity
    full_name           VARCHAR(200)        NOT NULL,
    alias               VARCHAR(200)        NULL,
    gender              ENUM('male','female','other','unknown')
                                            NOT NULL DEFAULT 'unknown',
    date_of_birth       DATE                NULL,
    age_at_incident     TINYINT UNSIGNED    NULL     COMMENT 'Computed or manually entered',
    nationality         VARCHAR(100)        NULL     DEFAULT 'Indian',
    id_type             VARCHAR(50)         NULL     COMMENT 'e.g. Aadhaar, Passport, PAN',
    id_number           VARCHAR(100)        NULL,

    -- Contact
    phone               VARCHAR(20)         NULL,
    email               VARCHAR(255)        NULL,
    address             TEXT                NULL,
    district_id         SMALLINT UNSIGNED   NULL,

    -- Incident impact
    injury_type         ENUM(
                            'none',
                            'minor',
                            'grievous',
                            'fatal'
                        )                   NOT NULL DEFAULT 'none',
    statement           TEXT                NULL     COMMENT 'Victim statement',
    is_minor            TINYINT(1)          NOT NULL DEFAULT 0,
    is_anonymous        TINYINT(1)          NOT NULL DEFAULT 0,

    created_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_victims PRIMARY KEY (id),
    CONSTRAINT fk_victims_fir
        FOREIGN KEY (fir_id)      REFERENCES fir       (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_victims_district
        FOREIGN KEY (district_id) REFERENCES districts (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Victims linked to FIR records';


-- -----------------------------------------------------------------------------
-- suspects
-- Persons of interest / accused linked to a FIR
-- A suspect can be linked to multiple FIRs via suspect_fir junction
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suspects (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,

    -- Identity
    full_name           VARCHAR(200)        NULL     COMMENT 'NULL if unknown',
    alias               VARCHAR(200)        NULL,
    gender              ENUM('male','female','other','unknown')
                                            NOT NULL DEFAULT 'unknown',
    date_of_birth       DATE                NULL,
    age_estimated       TINYINT UNSIGNED    NULL,
    nationality         VARCHAR(100)        NULL     DEFAULT 'Indian',
    id_type             VARCHAR(50)         NULL,
    id_number           VARCHAR(100)        NULL,

    -- Physical description
    height_cm           SMALLINT UNSIGNED   NULL,
    weight_kg           SMALLINT UNSIGNED   NULL,
    complexion          VARCHAR(50)         NULL,
    build               VARCHAR(50)         NULL,
    distinguishing_marks TEXT               NULL     COMMENT 'Tattoos, scars, etc.',
    photo_path          VARCHAR(500)        NULL,

    -- Contact / address
    phone               VARCHAR(20)         NULL,
    address             TEXT                NULL,
    district_id         SMALLINT UNSIGNED   NULL     COMMENT 'Last known district',

    -- Criminal profile
    is_known_criminal   TINYINT(1)          NOT NULL DEFAULT 0,
    gang_affiliation    VARCHAR(200)        NULL,
    threat_level        ENUM(
                            'low',
                            'medium',
                            'high',
                            'extreme'
                        )                   NOT NULL DEFAULT 'low',

    -- Arrest status
    arrest_status       ENUM(
                            'at_large',
                            'arrested',
                            'bailed',
                            'absconding',
                            'deceased'
                        )                   NOT NULL DEFAULT 'at_large',
    arrested_at         DATETIME            NULL,
    arrested_by         INT UNSIGNED        NULL     COMMENT 'FK → officers.id',

    created_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_suspects PRIMARY KEY (id),
    CONSTRAINT fk_suspects_district
        FOREIGN KEY (district_id) REFERENCES districts (id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_suspects_arrested_by
        FOREIGN KEY (arrested_by) REFERENCES officers  (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Suspects / accused persons — linked to FIRs via suspect_fir';


-- -----------------------------------------------------------------------------
-- suspect_fir
-- Junction: one suspect can appear in many FIRs; one FIR can have many suspects
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS suspect_fir (
    suspect_id      INT UNSIGNED        NOT NULL,
    fir_id          INT UNSIGNED        NOT NULL,
    role_in_case    VARCHAR(100)        NULL     COMMENT 'e.g. main accused, co-accused, witness',
    added_at        TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_suspect_fir PRIMARY KEY (suspect_id, fir_id),
    CONSTRAINT fk_sf_suspect
        FOREIGN KEY (suspect_id) REFERENCES suspects (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_sf_fir
        FOREIGN KEY (fir_id)     REFERENCES fir      (id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Many-to-many: suspects ↔ FIR records';


-- -----------------------------------------------------------------------------
-- crime_history
-- Prior criminal record entries for a suspect (past convictions / arrests)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crime_history (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    suspect_id      INT UNSIGNED        NOT NULL,
    crime_type_id   SMALLINT UNSIGNED   NULL,

    -- Record details
    fir_reference   VARCHAR(100)        NULL     COMMENT 'External FIR number if not in this system',
    fir_id          INT UNSIGNED        NULL     COMMENT 'Internal FK if record exists in this system',
    station_id      INT UNSIGNED        NULL     COMMENT 'Station that filed the prior case',
    incident_date   DATE                NULL,
    description     TEXT                NULL,

    -- Outcome
    outcome         ENUM(
                        'arrested',
                        'convicted',
                        'acquitted',
                        'bailed',
                        'absconded',
                        'pending'
                    )                   NOT NULL DEFAULT 'pending',
    sentence        VARCHAR(255)        NULL     COMMENT 'e.g. 3 years rigorous imprisonment',
    release_date    DATE                NULL,

    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_crime_history PRIMARY KEY (id),
    CONSTRAINT fk_ch_suspect
        FOREIGN KEY (suspect_id)    REFERENCES suspects       (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ch_crime_type
        FOREIGN KEY (crime_type_id) REFERENCES crime_types    (id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_ch_fir
        FOREIGN KEY (fir_id)        REFERENCES fir            (id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_ch_station
        FOREIGN KEY (station_id)    REFERENCES police_stations (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Prior criminal record / history for suspects';


SET FOREIGN_KEY_CHECKS = 1;
