-- =============================================================================
-- Migration 005 — Assets: Vehicles, Bank Accounts, Mobile Numbers
-- Tables: vehicles, bank_accounts, mobile_numbers
-- Depends on: 003_crime_types_fir, 004_persons
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- vehicles
-- Vehicles linked to suspects or used in crimes
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    suspect_id          INT UNSIGNED        NULL     COMMENT 'Owning/linked suspect',
    fir_id              INT UNSIGNED        NULL     COMMENT 'FIR where vehicle was involved',

    -- Registration
    registration_number VARCHAR(30)         NULL,
    chassis_number      VARCHAR(50)         NULL,
    engine_number       VARCHAR(50)         NULL,

    -- Description
    vehicle_type        ENUM(
                            'car',
                            'motorcycle',
                            'truck',
                            'bus',
                            'auto_rickshaw',
                            'bicycle',
                            'boat',
                            'other'
                        )                   NOT NULL DEFAULT 'car',
    make                VARCHAR(100)        NULL     COMMENT 'e.g. Toyota, Honda',
    model               VARCHAR(100)        NULL,
    color               VARCHAR(50)         NULL,
    year_of_manufacture YEAR                NULL,

    -- Status
    status              ENUM(
                            'active',
                            'seized',
                            'stolen',
                            'recovered',
                            'destroyed'
                        )                   NOT NULL DEFAULT 'active',
    seized_date         DATE                NULL,
    notes               TEXT                NULL,

    created_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_vehicles PRIMARY KEY (id),
    CONSTRAINT fk_vehicles_suspect
        FOREIGN KEY (suspect_id) REFERENCES suspects (id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_vehicles_fir
        FOREIGN KEY (fir_id)     REFERENCES fir      (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Vehicles linked to suspects or crime incidents';


-- -----------------------------------------------------------------------------
-- bank_accounts
-- Bank accounts linked to suspects (financial crime intelligence)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bank_accounts (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    suspect_id          INT UNSIGNED        NULL     COMMENT 'Account holder suspect',
    fir_id              INT UNSIGNED        NULL     COMMENT 'FIR where account was flagged',

    -- Account details
    account_number      VARCHAR(30)         NOT NULL,
    account_holder_name VARCHAR(200)        NOT NULL,
    bank_name           VARCHAR(200)        NOT NULL,
    branch_name         VARCHAR(200)        NULL,
    ifsc_code           VARCHAR(20)         NULL,
    swift_code          VARCHAR(20)         NULL,
    account_type        ENUM(
                            'savings',
                            'current',
                            'fixed_deposit',
                            'crypto_wallet',
                            'other'
                        )                   NOT NULL DEFAULT 'savings',

    -- Financial intelligence
    flagged_amount      DECIMAL(18,2)       NULL     COMMENT 'Amount involved in crime (INR)',
    transaction_count   INT UNSIGNED        NULL     COMMENT 'Number of suspicious transactions',
    freeze_status       ENUM(
                            'active',
                            'frozen',
                            'closed',
                            'under_scrutiny'
                        )                   NOT NULL DEFAULT 'active',
    freeze_date         DATE                NULL,
    freeze_order_ref    VARCHAR(100)        NULL,
    notes               TEXT                NULL,

    created_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_bank_accounts PRIMARY KEY (id),
    CONSTRAINT uq_bank_account_number UNIQUE (account_number, bank_name),
    CONSTRAINT fk_ba_suspect
        FOREIGN KEY (suspect_id) REFERENCES suspects (id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_ba_fir
        FOREIGN KEY (fir_id)     REFERENCES fir      (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Bank accounts linked to suspects for financial crime intelligence';


-- -----------------------------------------------------------------------------
-- mobile_numbers
-- Mobile numbers linked to suspects or used in crimes (call detail records)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mobile_numbers (
    id                  INT UNSIGNED        NOT NULL AUTO_INCREMENT,
    suspect_id          INT UNSIGNED        NULL,
    fir_id              INT UNSIGNED        NULL,

    -- Number details
    mobile_number       VARCHAR(20)         NOT NULL,
    country_code        VARCHAR(10)         NOT NULL DEFAULT '+91',
    operator            VARCHAR(100)        NULL     COMMENT 'e.g. Airtel, Jio, BSNL',
    sim_type            ENUM(
                            'prepaid',
                            'postpaid',
                            'unknown'
                        )                   NOT NULL DEFAULT 'unknown',
    imei_number         VARCHAR(20)         NULL     COMMENT 'Device IMEI',
    imsi_number         VARCHAR(20)         NULL     COMMENT 'SIM IMSI',

    -- Registration
    registered_name     VARCHAR(200)        NULL     COMMENT 'Name on SIM registration',
    registered_address  TEXT                NULL,
    is_verified         TINYINT(1)          NOT NULL DEFAULT 0,

    -- Intelligence
    is_active           TINYINT(1)          NOT NULL DEFAULT 1,
    last_location       VARCHAR(255)        NULL     COMMENT 'Last known tower location',
    surveillance_flag   TINYINT(1)          NOT NULL DEFAULT 0,
    notes               TEXT                NULL,

    created_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP           NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT pk_mobile_numbers PRIMARY KEY (id),
    CONSTRAINT fk_mn_suspect
        FOREIGN KEY (suspect_id) REFERENCES suspects (id) ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT fk_mn_fir
        FOREIGN KEY (fir_id)     REFERENCES fir      (id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Mobile numbers linked to suspects for telecom intelligence';


SET FOREIGN_KEY_CHECKS = 1;
