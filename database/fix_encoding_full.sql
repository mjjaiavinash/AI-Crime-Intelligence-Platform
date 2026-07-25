-- Fix corrupted Unicode/mojibake characters in all text columns
-- Run this once against the crime_intelligence database
-- Encoding: UTF-8

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ── fir table ─────────────────────────────────────────────────────────────────
UPDATE fir SET title = REPLACE(title, 'ÔÇö', '—');
UPDATE fir SET title = REPLACE(title, 'ÔÇÖ', '—');
UPDATE fir SET title = REPLACE(title, 'â€"', '—');
UPDATE fir SET title = REPLACE(title, 'â€"', '–');
UPDATE fir SET title = REPLACE(title, 'â€™', '''');
UPDATE fir SET title = REPLACE(title, 'â€œ', '"');
UPDATE fir SET title = REPLACE(title, 'â€', '"');
UPDATE fir SET title = REPLACE(title, 'â€¦', '…');
UPDATE fir SET title = REPLACE(title, 'Â·', '·');
UPDATE fir SET title = REPLACE(title, 'Â', '');

UPDATE fir SET description = REPLACE(description, 'ÔÇö', '—');
UPDATE fir SET description = REPLACE(description, 'ÔÇÖ', '—');
UPDATE fir SET description = REPLACE(description, 'â€"', '—');
UPDATE fir SET description = REPLACE(description, 'â€"', '–');
UPDATE fir SET description = REPLACE(description, 'â€™', '''');
UPDATE fir SET description = REPLACE(description, 'â€œ', '"');
UPDATE fir SET description = REPLACE(description, 'â€', '"');
UPDATE fir SET description = REPLACE(description, 'â€¦', '…');
UPDATE fir SET description = REPLACE(description, 'Â', '');

UPDATE fir SET location_name = REPLACE(location_name, 'ÔÇö', '—');
UPDATE fir SET location_name = REPLACE(location_name, 'â€™', '''');
UPDATE fir SET location_name = REPLACE(location_name, 'Â', '');

-- ── victims table ─────────────────────────────────────────────────────────────
UPDATE victims SET full_name = REPLACE(full_name, 'ÔÇö', '—');
UPDATE victims SET full_name = REPLACE(full_name, 'â€™', '''');
UPDATE victims SET full_name = REPLACE(full_name, 'Â', '');

UPDATE victims SET statement = REPLACE(statement, 'ÔÇö', '—');
UPDATE victims SET statement = REPLACE(statement, 'ÔÇÖ', '—');
UPDATE victims SET statement = REPLACE(statement, 'â€"', '—');
UPDATE victims SET statement = REPLACE(statement, 'â€™', '''');
UPDATE victims SET statement = REPLACE(statement, 'â€œ', '"');
UPDATE victims SET statement = REPLACE(statement, 'â€', '"');
UPDATE victims SET statement = REPLACE(statement, 'Â', '');

UPDATE victims SET address = REPLACE(address, 'Â', '');
UPDATE victims SET address = REPLACE(address, 'â€™', '''');

-- ── suspects table ────────────────────────────────────────────────────────────
UPDATE suspects SET full_name = REPLACE(full_name, 'ÔÇö', '—');
UPDATE suspects SET full_name = REPLACE(full_name, 'â€™', '''');
UPDATE suspects SET full_name = REPLACE(full_name, 'Â', '');

UPDATE suspects SET alias = REPLACE(alias, 'â€™', '''');
UPDATE suspects SET alias = REPLACE(alias, 'Â', '');

UPDATE suspects SET address = REPLACE(address, 'Â', '');
UPDATE suspects SET gang_affiliation = REPLACE(gang_affiliation, 'Â', '');

-- ── evidence table ────────────────────────────────────────────────────────────
UPDATE evidence SET title = REPLACE(title, 'ÔÇö', '—');
UPDATE evidence SET title = REPLACE(title, 'â€"', '—');
UPDATE evidence SET title = REPLACE(title, 'â€™', '''');
UPDATE evidence SET title = REPLACE(title, 'Â', '');

UPDATE evidence SET description = REPLACE(description, 'ÔÇö', '—');
UPDATE evidence SET description = REPLACE(description, 'â€"', '—');
UPDATE evidence SET description = REPLACE(description, 'â€™', '''');
UPDATE evidence SET description = REPLACE(description, 'Â', '');

-- ── investigation_notes table ─────────────────────────────────────────────────
UPDATE investigation_notes SET note = REPLACE(note, 'ÔÇö', '—');
UPDATE investigation_notes SET note = REPLACE(note, 'ÔÇÖ', '—');
UPDATE investigation_notes SET note = REPLACE(note, 'â€"', '—');
UPDATE investigation_notes SET note = REPLACE(note, 'â€™', '''');
UPDATE investigation_notes SET note = REPLACE(note, 'â€œ', '"');
UPDATE investigation_notes SET note = REPLACE(note, 'â€', '"');
UPDATE investigation_notes SET note = REPLACE(note, 'Â', '');

-- ── users table ───────────────────────────────────────────────────────────────
UPDATE users SET full_name = REPLACE(full_name, 'Â', '');
UPDATE users SET full_name = REPLACE(full_name, 'â€™', '''');

-- ── Verify ────────────────────────────────────────────────────────────────────
SELECT id, fir_number, title FROM fir ORDER BY id;
