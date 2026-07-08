-- =============================================================================
-- Seed Data — Development & Demo
-- Run after all migrations (001–008)
-- Passwords are bcrypt hashes of "admin1234" / "officer1234"
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ── roles ─────────────────────────────────────────────────────────────────────
INSERT INTO roles (id, name, description) VALUES
(1, 'admin',        'Full platform access — user management, all data'),
(2, 'supervisor',   'Manage investigations, view all data, assign officers'),
(3, 'investigator', 'Create/update FIRs, manage evidence, run investigations'),
(4, 'crime_analyst','Read-only analytics, generate AI intelligence reports')
ON DUPLICATE KEY UPDATE name = VALUES(name);


-- ── districts ─────────────────────────────────────────────────────────────────
INSERT INTO districts (id, name, state, country, latitude, longitude) VALUES
(1, 'Central Delhi',  'Delhi',     'India', 28.6448,  77.2167),
(2, 'South Delhi',    'Delhi',     'India', 28.5355,  77.2500),
(3, 'North Delhi',    'Delhi',     'India', 28.7041,  77.1025),
(4, 'Mumbai City',    'Maharashtra','India',18.9388,  72.8354),
(5, 'Mumbai Suburbs', 'Maharashtra','India',19.0760,  72.8777),
(6, 'Bengaluru Urban','Karnataka', 'India', 12.9716,  77.5946)
ON DUPLICATE KEY UPDATE name = VALUES(name);


-- ── police_stations ───────────────────────────────────────────────────────────
INSERT INTO police_stations (id, district_id, name, station_code, address, phone, latitude, longitude) VALUES
(1, 1, 'Connaught Place PS',   'DL-CP-001', 'Connaught Place, New Delhi',       '011-23412345', 28.6315, 77.2167),
(2, 1, 'Paharganj PS',         'DL-PG-002', 'Paharganj, New Delhi',             '011-23456789', 28.6448, 77.2100),
(3, 2, 'Hauz Khas PS',         'DL-HK-003', 'Hauz Khas, South Delhi',           '011-26567890', 28.5494, 77.2001),
(4, 4, 'Colaba PS',            'MH-CB-001', 'Colaba, Mumbai',                   '022-22151234', 18.9067, 72.8147),
(5, 5, 'Andheri PS',           'MH-AD-002', 'Andheri West, Mumbai',             '022-26781234', 19.1136, 72.8697),
(6, 6, 'Cubbon Park PS',       'KA-CP-001', 'Cubbon Park, Bengaluru',           '080-22942345', 12.9763, 77.5929)
ON DUPLICATE KEY UPDATE name = VALUES(name);


-- ── users ─────────────────────────────────────────────────────────────────────
-- Passwords: admin1234 → $2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIom
--            officer1234 → $2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
INSERT INTO users (id, role_id, username, email, hashed_password, full_name, phone, is_active) VALUES
(1, 1, 'admin',     'admin@crimeiq.local',     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIom', 'System Administrator', '9999000001', 1),
(2, 2, 'supervisor1','supervisor1@crimeiq.local','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uIom', 'Priya Sharma',         '9999000002', 1),
(3, 3, 'invest1',   'invest1@crimeiq.local',   '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Rajesh Kumar',         '9999000003', 1),
(4, 3, 'invest2',   'invest2@crimeiq.local',   '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Sunita Verma',         '9999000004', 1),
(5, 4, 'analyst1',  'analyst1@crimeiq.local',  '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Amit Singh',           '9999000005', 1)
ON DUPLICATE KEY UPDATE username = VALUES(username);


-- ── officers ──────────────────────────────────────────────────────────────────
INSERT INTO officers (id, user_id, station_id, district_id, badge_number, `rank`, department, date_of_joining) VALUES
(1, 3, 1, 1, 'DL-INS-1001', 'Inspector',     'CID',         '2015-06-01'),
(2, 4, 2, 1, 'DL-SI-1002',  'Sub-Inspector', 'General',     '2018-03-15'),
(3, 5, 4, 4, 'MH-INS-2001', 'Inspector',     'Cyber Cell',  '2016-09-10')
ON DUPLICATE KEY UPDATE badge_number = VALUES(badge_number);


-- ── crime_types ───────────────────────────────────────────────────────────────
INSERT INTO crime_types (id, category, name, ipc_section, bns_section, severity, is_cognizable, is_bailable) VALUES
(1,  'Violent',   'Murder',                '302',     '101',  'heinous',  1, 0),
(2,  'Violent',   'Attempt to Murder',     '307',     '109',  'serious',  1, 0),
(3,  'Violent',   'Grievous Hurt',         '325',     '117',  'serious',  1, 0),
(4,  'Violent',   'Assault',               '351',     '131',  'moderate', 1, 1),
(5,  'Property',  'Robbery',               '392',     '309',  'serious',  1, 0),
(6,  'Property',  'Dacoity',               '395',     '310',  'heinous',  1, 0),
(7,  'Property',  'Theft',                 '379',     '303',  'minor',    1, 1),
(8,  'Property',  'Burglary',              '457',     '331',  'moderate', 1, 0),
(9,  'Financial', 'Cheating / Fraud',      '420',     '318',  'moderate', 1, 1),
(10, 'Financial', 'Forgery',               '465',     '336',  'moderate', 1, 1),
(11, 'Cyber',     'Cyber Fraud',           '66C IT',  NULL,   'moderate', 1, 1),
(12, 'Cyber',     'Online Harassment',     '67 IT',   NULL,   'minor',    1, 1),
(13, 'Narcotics', 'Drug Possession',       '20 NDPS', NULL,   'serious',  1, 0),
(14, 'Narcotics', 'Drug Trafficking',      '21 NDPS', NULL,   'heinous',  1, 0),
(15, 'Traffic',   'Drunk Driving',         '185 MV',  NULL,   'minor',    1, 1)
ON DUPLICATE KEY UPDATE name = VALUES(name);


-- ── fir ───────────────────────────────────────────────────────────────────────
INSERT INTO fir (id, fir_number, station_id, district_id, crime_type_id, io_officer_id, filed_by_officer_id,
                 title, description, incident_date, reported_date, location_name, latitude, longitude, status) VALUES
(1, 'FIR/DL/2024/001', 1, 1, 5, 1, 1,
 'Armed Robbery at Connaught Place ATM',
 'Three masked individuals robbed a pedestrian at knifepoint near ATM on Janpath Road.',
 '2024-01-15 22:30:00', '2024-01-16 01:00:00', 'Janpath Road, CP', 28.6315, 77.2167, 'under_investigation'),

(2, 'FIR/DL/2024/002', 2, 1, 7, 2, 2,
 'Vehicle Theft from Paharganj Parking',
 'Honda City (DL-3C-AB-1234) stolen from multi-level parking between 14:00–18:00.',
 '2024-01-16 16:00:00', '2024-01-16 19:30:00', 'Paharganj Parking Lot', 28.6448, 77.2100, 'filed'),

(3, 'FIR/MH/2024/001', 4, 4, 11, 3, 3,
 'Cyber Fraud — UPI Phishing Scam',
 'Victim received a fake UPI payment link. Rs 2,40,000 debited from account.',
 '2024-02-10 11:00:00', '2024-02-10 14:00:00', 'Colaba, Mumbai', 18.9067, 72.8147, 'under_investigation'),

(4, 'FIR/DL/2024/003', 3, 2, 9, 1, 2,
 'Cheating by Property Dealer',
 'Accused collected advance payment of Rs 8,00,000 for flat and disappeared.',
 '2024-03-05 10:00:00', '2024-03-06 09:00:00', 'Hauz Khas Village', 28.5494, 77.2001, 'charge_sheet_filed'),

(5, 'FIR/DL/2024/004', 1, 1, 1, 1, 1,
 'Murder — Sector 7 Incident',
 'Body of unidentified male found with stab wounds near Sector 7 park.',
 '2024-04-20 03:15:00', '2024-04-20 06:00:00', 'Sector 7 Park, CP', 28.6350, 77.2200, 'under_investigation')
ON DUPLICATE KEY UPDATE fir_number = VALUES(fir_number);


-- ── fir_crime_types ───────────────────────────────────────────────────────────
INSERT INTO fir_crime_types (fir_id, crime_type_id, is_primary) VALUES
(1, 5, 1), (1, 4, 0),
(2, 7, 1),
(3, 11, 1),
(4, 9, 1), (4, 10, 0),
(5, 1, 1), (5, 2, 0)
ON DUPLICATE KEY UPDATE is_primary = VALUES(is_primary);


-- ── victims ───────────────────────────────────────────────────────────────────
INSERT INTO victims (id, fir_id, full_name, gender, age_at_incident, phone, address, district_id, injury_type, statement) VALUES
(1, 1, 'Mohan Lal Gupta',   'male',   45, '9811001001', '12 Rajpur Road, Delhi',       1, 'minor',  'Three men approached me near the ATM and demanded my wallet at knifepoint.'),
(2, 2, 'Seema Arora',       'female', 32, '9811002002', '45 Paharganj Lane, Delhi',    1, 'none',   'I parked my car at 2 PM and returned at 6 PM to find it missing.'),
(3, 3, 'Vikram Nair',       'male',   28, '9820003003', 'Flat 4B, Colaba Court, Mumbai',4,'none',   'I received a WhatsApp message with a UPI link claiming to be from my bank.'),
(4, 4, 'Anita Desai',       'female', 55, '9811004004', '7 Green Park, South Delhi',   2, 'none',   'I paid Rs 8 lakhs as advance for a flat. The dealer stopped responding.'),
(5, 5, 'Unknown Male',      'male',   NULL,NULL,         'Found near Sector 7 Park',   1, 'fatal',  NULL)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);


-- ── suspects ──────────────────────────────────────────────────────────────────
INSERT INTO suspects (id, full_name, alias, gender, age_estimated, district_id,
                      is_known_criminal, threat_level, arrest_status, gang_affiliation) VALUES
(1, 'Ravi Shankar Yadav', 'Ravi Bhai',  'male',   32, 1, 1, 'high',   'arrested',  'CP Gang'),
(2, 'Unknown Suspect A',  NULL,          'male',   25, 1, 0, 'medium', 'at_large',  NULL),
(3, 'Deepak Malhotra',    'D-Bhai',     'male',   40, 4, 1, 'medium', 'at_large',  NULL),
(4, 'Suresh Chand Jain',  'Suresh Seth','male',   50, 2, 0, 'low',    'arrested',  NULL)
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);


-- ── suspect_fir ───────────────────────────────────────────────────────────────
INSERT INTO suspect_fir (suspect_id, fir_id, role_in_case) VALUES
(1, 1, 'main accused'),
(2, 1, 'co-accused'),
(2, 2, 'main accused'),
(3, 3, 'main accused'),
(4, 4, 'main accused')
ON DUPLICATE KEY UPDATE role_in_case = VALUES(role_in_case);


-- ── crime_history ─────────────────────────────────────────────────────────────
INSERT INTO crime_history (suspect_id, crime_type_id, fir_reference, incident_date, outcome, sentence) VALUES
(1, 5,  'FIR/DL/2021/088', '2021-08-10', 'convicted',  '2 years rigorous imprisonment'),
(1, 7,  'FIR/DL/2019/034', '2019-03-22', 'convicted',  '6 months imprisonment'),
(3, 11, 'FIR/MH/2022/112', '2022-11-05', 'bailed',     NULL),
(4, 9,  'FIR/DL/2020/201', '2020-06-18', 'acquitted',  NULL);


-- ── vehicles ──────────────────────────────────────────────────────────────────
INSERT INTO vehicles (suspect_id, fir_id, registration_number, vehicle_type, make, model, color, year_of_manufacture, status) VALUES
(1, 1,  'DL-4C-XY-9988', 'motorcycle', 'Hero',  'Splendor', 'Black',  2020, 'seized'),
(2, 2,  'DL-3C-AB-1234', 'car',        'Honda', 'City',     'White',  2022, 'stolen'),
(3, 3,  'MH-02-BZ-4567', 'car',        'Maruti','Swift',    'Silver', 2019, 'active');


-- ── bank_accounts ─────────────────────────────────────────────────────────────
INSERT INTO bank_accounts (suspect_id, fir_id, account_number, account_holder_name, bank_name, ifsc_code, account_type, flagged_amount, freeze_status) VALUES
(3, 3, '9876543210001', 'Deepak Malhotra',   'HDFC Bank',  'HDFC0001234', 'savings', 240000.00, 'frozen'),
(4, 4, '1234567890002', 'Suresh Chand Jain', 'SBI',        'SBIN0005678', 'current', 800000.00, 'frozen');


-- ── mobile_numbers ────────────────────────────────────────────────────────────
INSERT INTO mobile_numbers (suspect_id, fir_id, mobile_number, operator, sim_type, registered_name, surveillance_flag) VALUES
(1, 1,  '9811111001', 'Airtel', 'prepaid',  'Ravi Yadav',     1),
(2, 1,  '9811111002', 'Jio',    'prepaid',  'Unknown',        1),
(3, 3,  '9820222001', 'Vodafone','postpaid','Deepak Malhotra', 1),
(4, 4,  '9811333001', 'BSNL',   'postpaid', 'Suresh Jain',    0);


-- ── evidence ──────────────────────────────────────────────────────────────────
INSERT INTO evidence (fir_id, collected_by, evidence_type, title, description, collection_date, status) VALUES
(1, 1, 'cctv_footage',      'ATM CCTV Footage',          'CCTV recording from ATM camera 22:15–22:45',         '2024-01-16 09:00:00', 'submitted_to_lab'),
(1, 1, 'physical',          'Knife (Exhibit A)',          'Folding knife recovered from suspect Ravi Yadav',    '2024-01-17 11:00:00', 'collected'),
(2, 2, 'documentary',       'Parking Ticket',             'Entry/exit ticket from parking lot CCTV system',    '2024-01-17 10:00:00', 'collected'),
(3, 3, 'digital',           'WhatsApp Chat Screenshot',   'Screenshot of phishing message received by victim', '2024-02-10 15:00:00', 'submitted_to_lab'),
(3, 3, 'documentary',       'Bank Transaction Record',    'HDFC Bank statement showing fraudulent debit',      '2024-02-11 10:00:00', 'lab_report_received'),
(5, 1, 'forensic',          'Post-Mortem Report',         'Forensic PM report — cause of death: stab wounds',  '2024-04-21 14:00:00', 'lab_report_received');


-- ── investigation ─────────────────────────────────────────────────────────────
INSERT INTO investigation (id, fir_id, lead_officer_id, start_date, target_close_date, status, outcome) VALUES
(1, 1, 1, '2024-01-16', '2024-04-16', 'active',            'pending'),
(2, 2, 2, '2024-01-17', '2024-04-17', 'active',            'pending'),
(3, 3, 3, '2024-02-10', '2024-05-10', 'pending_lab',       'pending'),
(4, 4, 1, '2024-03-06', '2024-06-06', 'charge_sheet_ready','charge_sheet_filed'),
(5, 5, 1, '2024-04-20', '2024-07-20', 'active',            'pending')
ON DUPLICATE KEY UPDATE status = VALUES(status);


-- ── investigation_officers ────────────────────────────────────────────────────
INSERT INTO investigation_officers (investigation_id, officer_id, role) VALUES
(1, 1, 'Lead IO'),
(1, 2, 'Supporting IO'),
(3, 3, 'Lead IO — Cyber Cell'),
(5, 1, 'Lead IO');


-- ── investigation_notes ───────────────────────────────────────────────────────
INSERT INTO investigation_notes (investigation_id, officer_id, note, note_type) VALUES
(1, 1, 'CCTV footage retrieved from ATM. Suspect face partially visible. Sent to forensic lab for enhancement.', 'lab_update'),
(1, 1, 'Suspect Ravi Shankar Yadav arrested from Lajpat Nagar. Knife recovered. Remanded to 14-day custody.',   'arrest_update'),
(3, 3, 'Traced UPI transaction to HDFC account held by Deepak Malhotra. Account frozen via court order.',        'lead'),
(4, 1, 'Charge sheet filed in Saket District Court. Next hearing: 2024-07-15.',                                  'court_update'),
(5, 1, 'Victim identified as Ramesh Tiwari (40), resident of Karol Bagh. Next of kin notified.',                 'general');


SET FOREIGN_KEY_CHECKS = 1;
