-- =============================================================================
-- Master Migration Runner
-- Run this file to build the entire schema from scratch
-- Usage: mysql -u root -p < run_all_migrations.sql
-- =============================================================================

DROP DATABASE IF EXISTS crime_intelligence;

CREATE DATABASE crime_intelligence
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE crime_intelligence;

-- Run in strict dependency order
SOURCE migrations/001_foundation.sql;
SOURCE migrations/002_users_officers.sql;
SOURCE migrations/003_crime_types_fir.sql;
SOURCE migrations/004_persons.sql;
SOURCE migrations/005_assets.sql;
SOURCE migrations/006_evidence_investigation.sql;
SOURCE migrations/007_indexes.sql;
SOURCE migrations/008_views.sql;

-- Load seed data for development
SOURCE seeds/sample_data.sql;

SELECT 'Schema created and seeded successfully.' AS status;
