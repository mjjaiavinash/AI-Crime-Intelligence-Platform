-- =============================================================================
-- Migration 002 — Users & Officers
-- Tables: users, officers
-- Depends on: 001_foundation (roles, districts, police_stations)
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- users
-- Platform login accounts — replaces the old inline ENUM role with FK to roles
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    role_id         TINYINT UNSIGNED    NOT NULL DEFAULT 3 COMMENT 'FK → roles.id (3=investigator)',
    username        VARCHAR(100)        NOT NULL,
    email           VARCHAR(255)        NOT NULL,
    hashed_password VARCHAR(255)        NOT NULL,
    full_name       VARCHAR(200)        NULL,
    phone           VARCHAR(20)         NULL,
    is_active       TINYINT(1)          NOT NULL DEFAULT 1,
    last_login_at   TIMESTAMP           NULL,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_username UNIQUE (username),
    CONSTRAINT uq_users_email    UNIQUE (email),
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES roles (id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Platform user accounts';


-- -----------------------------------------------------------------------------
-- officers
-- Police officer profiles — extends users with badge/rank/station details
-- One user can have at most one officer profile
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS officers (
    id              INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED        NOT NULL COMMENT 'FK → users.id (1:1)',
    station_id      INT UNSIGNED        NOT NULL COMMENT 'Assigned station',
    district_id     SMALLINT UNSIGNED   NOT NULL COMMENT 'Assigned district',
    badge_number    VARCHAR(50)         NOT NULL,
    `rank`            VARCHAR(100)        NOT NULL COMMENT 'e.g. Inspector, Sub-Inspector, Constable',
    department      VARCHAR(150)        NULL     COMMENT 'e.g. CID, Cyber Cell, Narcotics',
    date_of_joining DATE                NULL,
    is_active       TINYINT(1)          NOT NULL DEFAULT 1,
    created_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_officers PRIMARY KEY (id),
    CONSTRAINT uq_officers_user    UNIQUE (user_id),
    CONSTRAINT uq_officers_badge   UNIQUE (badge_number),
    CONSTRAINT fk_officers_user
        FOREIGN KEY (user_id)    REFERENCES users          (id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_officers_station
        FOREIGN KEY (station_id) REFERENCES police_stations (id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_officers_district
        FOREIGN KEY (district_id) REFERENCES districts      (id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Police officer profiles linked to user accounts';


SET FOREIGN_KEY_CHECKS = 1;
