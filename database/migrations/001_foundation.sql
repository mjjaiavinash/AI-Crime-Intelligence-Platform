-- =============================================================================
-- Migration 001 — Foundation Tables
-- Tables: roles, districts, police_stations
-- Run before all other migrations
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- roles
-- Defines platform access roles (admin, analyst, officer, viewer)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS roles (
    id          TINYINT UNSIGNED    NOT NULL AUTO_INCREMENT,
    name        VARCHAR(50)         NOT NULL,
    description VARCHAR(255)        NULL,
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_roles PRIMARY KEY (id),
    CONSTRAINT uq_roles_name UNIQUE (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Platform access roles';


-- -----------------------------------------------------------------------------
-- districts
-- Administrative districts / jurisdictions
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS districts (
    id          SMALLINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)        NOT NULL,
    state       VARCHAR(100)        NOT NULL,
    country     VARCHAR(100)        NOT NULL DEFAULT 'India',
    latitude    DECIMAL(10,8)       NULL     COMMENT 'District centroid latitude',
    longitude   DECIMAL(11,8)       NULL     COMMENT 'District centroid longitude',
    created_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_districts PRIMARY KEY (id),
    CONSTRAINT uq_districts_name_state UNIQUE (name, state)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Administrative districts and jurisdictions';


-- -----------------------------------------------------------------------------
-- police_stations
-- Physical police stations linked to a district
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS police_stations (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    district_id     SMALLINT UNSIGNED   NOT NULL,
    name            VARCHAR(150)        NOT NULL,
    station_code    VARCHAR(30)         NOT NULL COMMENT 'Official station code / PS number',
    address         VARCHAR(500)        NULL,
    phone           VARCHAR(20)         NULL,
    email           VARCHAR(255)        NULL,
    latitude        DECIMAL(10,8)       NULL,
    longitude       DECIMAL(11,8)       NULL,
    is_active       TINYINT(1)          NOT NULL DEFAULT 1,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_police_stations PRIMARY KEY (id),
    CONSTRAINT uq_police_stations_code UNIQUE (station_code),
    CONSTRAINT fk_ps_district
        FOREIGN KEY (district_id) REFERENCES districts (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Police stations linked to districts';


SET FOREIGN_KEY_CHECKS = 1;
