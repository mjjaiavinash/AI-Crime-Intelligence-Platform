-- =============================================================================
-- Karnataka Bulk Seed Data — Heatmaps, Trends, Alerts
-- Run after sample_data.sql and karnataka_districts.sql
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ── Bengaluru Urban district (id=6), station Cubbon Park PS (id=6)
-- We need a Bengaluru East-like station — use station 6 for all Bengaluru FIRs
-- Mysuru station id = from karnataka_districts: Mysuru City PS inserted without fixed id
-- We'll use district_id and reference stations by their known inserted order.
-- Karnataka stations start after id=6 (sample_data has 1-6).
-- karnataka_districts inserts without fixed IDs so we reference by station_code via subquery.

-- ── Additional Suspects ────────────────────────────────────────────────────────
INSERT INTO suspects (id, full_name, alias, gender, age_estimated, district_id,
                      is_known_criminal, threat_level, arrest_status, gang_affiliation) VALUES
(5,  'Manoj Kumar Reddy',  'Manoj R',    'male',   28, 6,  1, 'high',    'at_large',   'Whitefield Gang'),
(6,  'Syed Imran',         'Imran Bhai', 'male',   35, 6,  1, 'extreme', 'at_large',   'Whitefield Gang'),
(7,  'Kiran Naik',         'Kiru',       'male',   22, 6,  1, 'medium',  'at_large',   'Whitefield Gang'),
(8,  'Pradeep Gowda',      'PG',         'male',   30, 27, 1, 'high',    'at_large',   'Mysuru Syndicate'),
(9,  'Lokesh B',           'Loki',       'male',   26, 27, 1, 'high',    'at_large',   'Mysuru Syndicate'),
(10, 'Ramesh Naidu',       'Ramu',       'male',   40, 27, 1, 'extreme', 'bailed',     'Mysuru Syndicate'),
(11, 'Farhan Sheikh',      NULL,          'male',   33, 18, 0, 'medium',  'at_large',   NULL),
(12, 'Anand Patil',        'Anu',        'male',   29, 18, 1, 'high',    'at_large',   'Dharwad Crew'),
(13, 'Basavaraj Hiremath', 'Basu',       'male',   45, 18, 1, 'high',    'arrested',   'Dharwad Crew'),
(14, 'Venkatesh T',        'Venky',      'male',   31, 6,  1, 'medium',  'at_large',   NULL),
(15, 'Sunil D Souza',      NULL,          'male',   27, 16, 0, 'low',     'at_large',   NULL)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- ── FIRs — Bengaluru Urban (district_id=6, station_id=6) ──────────────────────
INSERT INTO fir (id, fir_number, station_id, district_id, crime_type_id, io_officer_id, filed_by_officer_id,
                 title, description, incident_date, reported_date, location_name, latitude, longitude, status) VALUES

-- Whitefield cluster (triggers hotspot alert — 6 FIRs near same coords)
(10, 'FIR/KA/BLR/2025/010', 6, 6, 7,  1, 1, 'Vehicle Theft — Whitefield',         'Bike stolen from ITPL parking.',                          '2025-06-10 14:00:00', '2025-06-10 15:00:00', 'ITPL, Whitefield',        12.9850, 77.7480, 'filed'),
(11, 'FIR/KA/BLR/2025/011', 6, 6, 7,  1, 1, 'Vehicle Theft — Whitefield',         'Scooty stolen from apartment basement.',                  '2025-06-11 09:00:00', '2025-06-11 10:00:00', 'Whitefield Main Rd',      12.9860, 77.7490, 'filed'),
(12, 'FIR/KA/BLR/2025/012', 6, 6, 7,  1, 1, 'Vehicle Theft — Whitefield',         'Car stolen from tech park.',                              '2025-06-11 20:00:00', '2025-06-11 21:30:00', 'Whitefield Tech Park',    12.9855, 77.7485, 'under_investigation'),
(13, 'FIR/KA/BLR/2025/013', 6, 6, 8,  1, 1, 'Burglary — Whitefield Apartment',    'House broken into, jewellery stolen.',                    '2025-06-12 03:00:00', '2025-06-12 07:00:00', 'Whitefield Apt Complex',  12.9845, 77.7475, 'filed'),
(14, 'FIR/KA/BLR/2025/014', 6, 6, 7,  1, 1, 'Vehicle Theft — Whitefield',         'Two-wheeler stolen near metro station.',                  '2025-06-12 18:00:00', '2025-06-12 19:00:00', 'Whitefield Metro',        12.9870, 77.7500, 'filed'),
(15, 'FIR/KA/BLR/2025/015', 6, 6, 5,  1, 1, 'Robbery — Whitefield',               'Pedestrian robbed at knifepoint near park.',              '2025-06-13 22:00:00', '2025-06-13 23:00:00', 'Whitefield Park',         12.9852, 77.7482, 'under_investigation'),

-- Bengaluru other areas
(16, 'FIR/KA/BLR/2025/016', 6, 6, 11, 1, 1, 'Cyber Fraud — Koramangala',          'UPI fraud, Rs 1.5L lost.',                                '2025-05-01 11:00:00', '2025-05-01 13:00:00', 'Koramangala 5th Block',   12.9352, 77.6245, 'under_investigation'),
(17, 'FIR/KA/BLR/2025/017', 6, 6, 11, 1, 1, 'Cyber Fraud — Indiranagar',          'Online banking fraud.',                                   '2025-05-10 10:00:00', '2025-05-10 12:00:00', 'Indiranagar 100ft Rd',    12.9784, 77.6408, 'filed'),
(18, 'FIR/KA/BLR/2025/018', 6, 6, 9,  1, 1, 'Cheating — HSR Layout',              'Fake investment scheme, Rs 5L cheated.',                  '2025-04-15 09:00:00', '2025-04-16 10:00:00', 'HSR Layout Sector 2',     12.9116, 77.6389, 'charge_sheet_filed'),
(19, 'FIR/KA/BLR/2025/019', 6, 6, 1,  1, 1, 'Murder — Electronic City',           'Body found near flyover.',                                '2025-03-20 04:00:00', '2025-03-20 06:30:00', 'Electronic City Phase 1', 12.8399, 77.6770, 'under_investigation'),
(20, 'FIR/KA/BLR/2025/020', 6, 6, 4,  1, 1, 'Assault — MG Road',                  'Bar fight, victim hospitalised.',                         '2025-04-05 23:00:00', '2025-04-06 01:00:00', 'MG Road, Bengaluru',      12.9756, 77.6097, 'filed'),
(21, 'FIR/KA/BLR/2025/021', 6, 6, 13, 1, 1, 'Drug Possession — Hebbal',           'Ganja seized from suspect.',                              '2025-02-14 16:00:00', '2025-02-14 17:00:00', 'Hebbal Flyover',          13.0358, 77.5970, 'charge_sheet_filed'),
(22, 'FIR/KA/BLR/2025/022', 6, 6, 7,  1, 1, 'Vehicle Theft — Jayanagar',          'Car stolen from market parking.',                         '2025-01-20 12:00:00', '2025-01-20 14:00:00', 'Jayanagar 4th Block',     12.9250, 77.5938, 'filed'),
(23, 'FIR/KA/BLR/2025/023', 6, 6, 5,  1, 1, 'Robbery — Rajajinagar',              'Chain snatching on busy road.',                           '2025-01-25 08:30:00', '2025-01-25 09:00:00', 'Rajajinagar 1st Block',   12.9900, 77.5530, 'under_investigation'),

-- ── FIRs — Mysuru (district_id=27) ────────────────────────────────────────────
(24, 'FIR/KA/MYS/2025/001', 6, 27, 5,  1, 1, 'Robbery — Mysuru Palace Area',       'Tourist robbed near palace gate.',                        '2025-05-15 19:00:00', '2025-05-15 20:00:00', 'Mysuru Palace Road',      12.3052, 76.6552, 'under_investigation'),
(25, 'FIR/KA/MYS/2025/002', 6, 27, 5,  1, 1, 'Robbery — Mysuru Market',            'Shopkeeper robbed at closing time.',                      '2025-05-18 21:00:00', '2025-05-18 22:00:00', 'Devaraja Market, Mysuru', 12.3100, 76.6500, 'filed'),
(26, 'FIR/KA/MYS/2025/003', 6, 27, 5,  1, 1, 'Robbery — Mysuru Bus Stand',         'Passenger robbed at bus stand.',                          '2025-05-20 06:00:00', '2025-05-20 07:00:00', 'KSRTC Bus Stand, Mysuru', 12.3020, 76.6400, 'filed'),
(27, 'FIR/KA/MYS/2025/004', 6, 27, 6,  1, 1, 'Dacoity — Mysuru Outskirts',         'Armed gang looted a house.',                              '2025-04-10 02:00:00', '2025-04-10 06:00:00', 'Mysuru Ring Road',        12.2900, 76.6300, 'under_investigation'),
(28, 'FIR/KA/MYS/2025/005', 6, 27, 9,  1, 1, 'Cheating — Mysuru',                  'Land document fraud.',                                    '2025-03-05 10:00:00', '2025-03-06 09:00:00', 'Mysuru City Centre',      12.2958, 76.6394, 'charge_sheet_filed'),
(29, 'FIR/KA/MYS/2025/006', 6, 27, 7,  1, 1, 'Vehicle Theft — Mysuru',             'Bike stolen from college parking.',                       '2025-02-20 17:00:00', '2025-02-20 18:30:00', 'Mysuru University Road',  12.3200, 76.6550, 'filed'),
(30, 'FIR/KA/MYS/2025/007', 6, 27, 11, 1, 1, 'Cyber Fraud — Mysuru',               'OTP fraud, Rs 80K lost.',                                 '2025-01-15 14:00:00', '2025-01-15 15:00:00', 'Mysuru IT Park',          12.3150, 76.6600, 'filed'),

-- ── FIRs — Dharwad/Hubballi (district_id=18) ──────────────────────────────────
(31, 'FIR/KA/DHW/2025/001', 6, 18, 5,  1, 1, 'Robbery — Hubballi',                 'Cash van robbery by armed gang.',                         '2025-05-05 10:00:00', '2025-05-05 11:00:00', 'Hubballi Old Town',       15.3647, 75.1240, 'under_investigation'),
(32, 'FIR/KA/DHW/2025/002', 6, 18, 5,  1, 1, 'Robbery — Dharwad',                  'Petrol bunk robbery at night.',                           '2025-05-12 23:00:00', '2025-05-13 00:30:00', 'Dharwad NH48',            15.4589, 75.0078, 'filed'),
(33, 'FIR/KA/DHW/2025/003', 6, 18, 6,  1, 1, 'Dacoity — Hubballi',                 'Gang looted jewellery shop.',                             '2025-04-22 20:00:00', '2025-04-22 21:30:00', 'Hubballi Market',         15.3500, 75.1350, 'under_investigation'),
(34, 'FIR/KA/DHW/2025/004', 6, 18, 1,  1, 1, 'Murder — Dharwad',                   'Dispute turned fatal.',                                   '2025-03-18 22:00:00', '2025-03-19 01:00:00', 'Dharwad Village Road',    15.4700, 75.0200, 'under_investigation'),
(35, 'FIR/KA/DHW/2025/005', 6, 18, 7,  1, 1, 'Vehicle Theft — Hubballi',           'Auto stolen from stand.',                                 '2025-02-10 08:00:00', '2025-02-10 09:00:00', 'Hubballi Auto Stand',     15.3600, 75.1200, 'filed'),

-- ── FIRs — Mangaluru (district_id=16) ─────────────────────────────────────────
(36, 'FIR/KA/MNG/2025/001', 6, 16, 11, 1, 1, 'Cyber Fraud — Mangaluru',            'Banking phishing scam.',                                  '2025-05-08 11:00:00', '2025-05-08 13:00:00', 'Mangaluru City Centre',   12.8698, 74.8431, 'filed'),
(37, 'FIR/KA/MNG/2025/002', 6, 16, 7,  1, 1, 'Vehicle Theft — Mangaluru',          'Bike stolen from beach parking.',                         '2025-04-18 17:00:00', '2025-04-18 18:30:00', 'Panambur Beach, Mangaluru',12.9200, 74.8200, 'filed'),
(38, 'FIR/KA/MNG/2025/003', 6, 16, 9,  1, 1, 'Cheating — Mangaluru',               'Fake job offer fraud.',                                   '2025-03-25 10:00:00', '2025-03-26 09:00:00', 'Mangaluru Port Area',     12.8600, 74.8500, 'charge_sheet_filed'),
(39, 'FIR/KA/MNG/2025/004', 6, 16, 4,  1, 1, 'Assault — Mangaluru',                'Road rage assault.',                                      '2025-02-28 20:00:00', '2025-02-28 21:00:00', 'Mangaluru NH66',          12.8750, 74.8600, 'filed'),

-- ── FIRs — Belagavi (district_id=9) ───────────────────────────────────────────
(40, 'FIR/KA/BLG/2025/001', 6, 9,  5,  1, 1, 'Robbery — Belagavi',                 'Chain snatching near temple.',                            '2025-05-22 07:30:00', '2025-05-22 08:30:00', 'Belagavi Temple Road',    15.8497, 74.4977, 'filed'),
(41, 'FIR/KA/BLG/2025/002', 6, 9,  1,  1, 1, 'Murder — Belagavi',                  'Gang rivalry killing.',                                   '2025-04-30 01:00:00', '2025-04-30 04:00:00', 'Belagavi Old Town',       15.8600, 74.5100, 'under_investigation'),
(42, 'FIR/KA/BLG/2025/003', 6, 9,  14, 1, 1, 'Drug Trafficking — Belagavi',        'Goa border drug seizure.',                                '2025-03-10 03:00:00', '2025-03-10 05:00:00', 'Belagavi Border NH48',    15.8300, 74.4800, 'charge_sheet_filed'),

-- ── FIRs — Kalaburagi (district_id=22) ────────────────────────────────────────
(43, 'FIR/KA/KLB/2025/001', 6, 22, 6,  1, 1, 'Dacoity — Kalaburagi',               'Rural house dacoity.',                                    '2025-05-25 02:00:00', '2025-05-25 05:00:00', 'Kalaburagi Rural',        17.3297, 76.8343, 'under_investigation'),
(44, 'FIR/KA/KLB/2025/002', 6, 22, 9,  1, 1, 'Cheating — Kalaburagi',              'Fake land registration fraud.',                           '2025-04-12 10:00:00', '2025-04-13 09:00:00', 'Kalaburagi City',         17.3400, 76.8400, 'filed'),

-- ── FIRs — Shivamogga (district_id=30) ────────────────────────────────────────
(45, 'FIR/KA/SMG/2025/001', 6, 30, 7,  1, 1, 'Vehicle Theft — Shivamogga',         'Car stolen from hospital parking.',                       '2025-05-03 14:00:00', '2025-05-03 15:30:00', 'Shivamogga Hospital Rd',  13.9299, 75.5681, 'filed'),
(46, 'FIR/KA/SMG/2025/002', 6, 30, 4,  1, 1, 'Assault — Shivamogga',               'Political rivalry assault.',                              '2025-04-08 19:00:00', '2025-04-08 20:30:00', 'Shivamogga Town',         13.9350, 75.5700, 'under_investigation'),

-- ── FIRs — Tumakuru (district_id=31) ──────────────────────────────────────────
(47, 'FIR/KA/TMK/2025/001', 6, 31, 11, 1, 1, 'Cyber Fraud — Tumakuru',             'Fake lottery fraud.',                                     '2025-05-17 13:00:00', '2025-05-17 14:30:00', 'Tumakuru City',           13.3379, 77.1173, 'filed'),
(48, 'FIR/KA/TMK/2025/002', 6, 31, 5,  1, 1, 'Robbery — Tumakuru Highway',         'Highway robbery at night.',                               '2025-04-25 23:30:00', '2025-04-26 01:00:00', 'NH48 Tumakuru',           13.3500, 77.1300, 'under_investigation'),

-- ── FIRs — Hassan (district_id=20) ────────────────────────────────────────────
(49, 'FIR/KA/HSN/2025/001', 6, 20, 9,  1, 1, 'Cheating — Hassan',                  'Chit fund fraud.',                                        '2025-03-15 10:00:00', '2025-03-16 09:00:00', 'Hassan City',             13.0033, 76.1004, 'charge_sheet_filed'),
(50, 'FIR/KA/HSN/2025/002', 6, 20, 7,  1, 1, 'Vehicle Theft — Hassan',             'Tractor stolen from farm.',                               '2025-02-05 05:00:00', '2025-02-05 07:00:00', 'Hassan Rural',            13.0100, 76.1100, 'filed'),

-- ── More Bengaluru FIRs for repeat offender triggers ──────────────────────────
(51, 'FIR/KA/BLR/2025/051', 6, 6, 5,  1, 1, 'Robbery — Majestic',                 'Bag snatching near bus stand.',                           '2025-06-01 08:00:00', '2025-06-01 09:00:00', 'Majestic Bus Stand',      12.9767, 77.5713, 'filed'),
(52, 'FIR/KA/BLR/2025/052', 6, 6, 7,  1, 1, 'Vehicle Theft — Yelahanka',          'Bike stolen from market.',                                '2025-06-02 16:00:00', '2025-06-02 17:00:00', 'Yelahanka New Town',      13.1007, 77.5963, 'filed'),
(53, 'FIR/KA/BLR/2025/053', 6, 6, 11, 1, 1, 'Cyber Fraud — Marathahalli',         'Investment app fraud.',                                   '2025-06-03 11:00:00', '2025-06-03 13:00:00', 'Marathahalli Bridge',     12.9591, 77.6974, 'under_investigation'),
(54, 'FIR/KA/BLR/2025/054', 6, 6, 5,  1, 1, 'Robbery — BTM Layout',               'Purse snatching.',                                        '2025-06-04 20:00:00', '2025-06-04 21:00:00', 'BTM Layout 2nd Stage',    12.9166, 77.6101, 'filed'),
(55, 'FIR/KA/BLR/2025/055', 6, 6, 4,  1, 1, 'Assault — Shivajinagar',             'Brawl outside pub.',                                      '2025-06-05 01:00:00', '2025-06-05 02:00:00', 'Shivajinagar, Bengaluru', 12.9850, 77.6010, 'filed'),
(56, 'FIR/KA/BLR/2025/056', 6, 6, 7,  1, 1, 'Vehicle Theft — Banashankari',       'Car stolen from temple parking.',                         '2025-06-06 10:00:00', '2025-06-06 11:30:00', 'Banashankari Temple',     12.9255, 77.5468, 'filed')

ON DUPLICATE KEY UPDATE fir_number = VALUES(fir_number);

-- ── Suspect-FIR links ──────────────────────────────────────────────────────────
-- Manoj Kumar Reddy (id=5) — Whitefield Gang — 6 FIRs in last 30 days (triggers repeat alert)
INSERT INTO suspect_fir (suspect_id, fir_id, role_in_case) VALUES
(5, 10, 'main accused'),
(5, 11, 'main accused'),
(5, 12, 'main accused'),
(5, 14, 'co-accused'),
(5, 15, 'main accused'),
(5, 51, 'main accused'),
-- Syed Imran (id=6) — Whitefield Gang
(6, 10, 'co-accused'),
(6, 13, 'main accused'),
(6, 15, 'co-accused'),
(6, 54, 'main accused'),
(6, 55, 'main accused'),
-- Kiran Naik (id=7) — Whitefield Gang
(7, 11, 'co-accused'),
(7, 12, 'co-accused'),
(7, 52, 'main accused'),
(7, 56, 'main accused'),
-- Pradeep Gowda (id=8) — Mysuru Syndicate — 4 FIRs (triggers gang alert)
(8, 24, 'main accused'),
(8, 25, 'main accused'),
(8, 26, 'co-accused'),
(8, 27, 'main accused'),
-- Lokesh B (id=9) — Mysuru Syndicate
(9, 25, 'co-accused'),
(9, 26, 'main accused'),
(9, 27, 'co-accused'),
(9, 29, 'main accused'),
-- Ramesh Naidu (id=10) — Mysuru Syndicate
(10, 24, 'co-accused'),
(10, 27, 'co-accused'),
(10, 28, 'main accused'),
-- Anand Patil (id=12) — Dharwad Crew
(12, 31, 'main accused'),
(12, 32, 'main accused'),
(12, 33, 'co-accused'),
(12, 34, 'co-accused'),
-- Basavaraj Hiremath (id=13) — Dharwad Crew
(13, 31, 'co-accused'),
(13, 33, 'main accused'),
(13, 35, 'main accused'),
-- Venkatesh T (id=14) — repeat offender, no gang
(14, 16, 'main accused'),
(14, 17, 'main accused'),
(14, 53, 'main accused'),
(14, 47, 'co-accused'),
-- Sunil D Souza (id=15)
(15, 36, 'main accused'),
(15, 37, 'main accused'),
(15, 39, 'co-accused')
ON DUPLICATE KEY UPDATE role_in_case = VALUES(role_in_case);

SET FOREIGN_KEY_CHECKS = 1;
