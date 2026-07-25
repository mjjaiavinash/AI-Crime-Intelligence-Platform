-- =============================================================================
-- Karnataka Districts & Police Stations Seed
-- All 30 Karnataka districts with 2 police stations each (60 stations total)
-- Run after sample_data.sql  OR  run standalone after migrations 001–008
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ── Districts ─────────────────────────────────────────────────────────────────
INSERT INTO districts (id, name, state, country, latitude, longitude) VALUES
( 7, 'Bagalkot',          'Karnataka', 'India', 16.1691,  75.6966),
( 8, 'Ballari',           'Karnataka', 'India', 15.1394,  76.9214),
( 9, 'Belagavi',          'Karnataka', 'India', 15.8497,  74.4977),
(10, 'Bengaluru Rural',   'Karnataka', 'India', 13.2257,  77.5673),
(11, 'Bidar',             'Karnataka', 'India', 17.9104,  77.5199),
(12, 'Chamarajanagar',    'Karnataka', 'India', 11.9261,  76.9437),
(13, 'Chikkaballapura',   'Karnataka', 'India', 13.4355,  77.7315),
(14, 'Chikkamagaluru',    'Karnataka', 'India', 13.3161,  75.7720),
(15, 'Chitradurga',       'Karnataka', 'India', 14.2251,  76.3980),
(16, 'Dakshina Kannada',  'Karnataka', 'India', 12.8438,  75.2479),
(17, 'Davanagere',        'Karnataka', 'India', 14.4644,  75.9218),
(18, 'Dharwad',           'Karnataka', 'India', 15.4589,  75.0078),
(19, 'Gadag',             'Karnataka', 'India', 15.4166,  75.6271),
(20, 'Hassan',            'Karnataka', 'India', 13.0033,  76.1004),
(21, 'Haveri',            'Karnataka', 'India', 14.7939,  75.3996),
(22, 'Kalaburagi',        'Karnataka', 'India', 17.3297,  76.8343),
(23, 'Kodagu',            'Karnataka', 'India', 12.3375,  75.8069),
(24, 'Kolar',             'Karnataka', 'India', 13.1360,  78.1294),
(25, 'Koppal',            'Karnataka', 'India', 15.3508,  76.1549),
(26, 'Mandya',            'Karnataka', 'India', 12.5218,  76.8951),
(27, 'Mysuru',            'Karnataka', 'India', 12.2958,  76.6394),
(28, 'Raichur',           'Karnataka', 'India', 16.2120,  77.3566),
(29, 'Ramanagara',        'Karnataka', 'India', 12.7157,  77.2819),
(30, 'Shivamogga',        'Karnataka', 'India', 13.9299,  75.5681),
(31, 'Tumakuru',          'Karnataka', 'India', 13.3379,  77.1173),
(32, 'Udupi',             'Karnataka', 'India', 13.3409,  74.7421),
(33, 'Uttara Kannada',    'Karnataka', 'India', 14.7860,  74.6562),
(34, 'Vijayapura',        'Karnataka', 'India', 16.8302,  75.7100),
(35, 'Vijayanagara',      'Karnataka', 'India', 15.1394,  76.9214),
(36, 'Yadgir',            'Karnataka', 'India', 16.7710,  77.1381)
ON DUPLICATE KEY UPDATE name = VALUES(name), latitude = VALUES(latitude), longitude = VALUES(longitude);


-- ── Police Stations ───────────────────────────────────────────────────────────
INSERT INTO police_stations (district_id, name, station_code, address, phone, latitude, longitude) VALUES
-- Bagalkot (7)
( 7, 'Bagalkot Town PS',        'KA-BK-001', 'Station Road, Bagalkot',              '08354-220100', 16.1800,  75.6970),
( 7, 'Badami PS',               'KA-BK-002', 'Fort Road, Badami',                   '08357-220200', 15.9200,  75.6800),

-- Ballari (8)
( 8, 'Ballari Town PS',         'KA-BL-001', 'MG Road, Ballari',                    '08392-220100', 15.1400,  76.9200),
( 8, 'Hospet PS',               'KA-BL-002', 'Station Road, Hospet',                '08394-220200', 15.2700,  76.3900),

-- Belagavi (9)
( 9, 'Belagavi City PS',        'KA-BG-001', 'Club Road, Belagavi',                 '0831-2420100', 15.8600,  74.5000),
( 9, 'Gokak PS',                'KA-BG-002', 'Main Road, Gokak',                    '08332-220200', 16.1700,  74.8200),

-- Bengaluru Rural (10)
(10, 'Devanahalli PS',          'KA-BR-001', 'Airport Road, Devanahalli',           '08110-220100', 13.2500,  77.7100),
(10, 'Doddaballapura PS',       'KA-BR-002', 'BH Road, Doddaballapura',             '08112-220200', 13.2900,  77.5400),

-- Bidar (11)
(11, 'Bidar Town PS',           'KA-BD-001', 'Station Road, Bidar',                 '08482-220100', 17.9100,  77.5200),
(11, 'Basavakalyan PS',         'KA-BD-002', 'Main Road, Basavakalyan',             '08481-220200', 17.8700,  76.9500),

-- Chamarajanagar (12)
(12, 'Chamarajanagar PS',       'KA-CJ-001', 'BM Road, Chamarajanagar',             '08226-220100', 11.9300,  76.9400),
(12, 'Kollegal PS',             'KA-CJ-002', 'Main Road, Kollegal',                 '08224-220200', 12.1500,  77.1100),

-- Chikkaballapura (13)
(13, 'Chikkaballapura PS',      'KA-CB-001', 'NH 648, Chikkaballapura',             '08156-220100', 13.4300,  77.7300),
(13, 'Gudibande PS',            'KA-CB-002', 'Main Road, Gudibande',                '08155-220200', 13.8800,  77.7500),

-- Chikkamagaluru (14)
(14, 'Chikkamagaluru PS',       'KA-CM-001', 'MG Road, Chikkamagaluru',             '08262-220100', 13.3200,  75.7700),
(14, 'Kadur PS',                'KA-CM-002', 'Station Road, Kadur',                 '08267-220200', 13.5500,  76.0100),

-- Chitradurga (15)
(15, 'Chitradurga PS',          'KA-CD-001', 'Fort Road, Chitradurga',              '08194-220100', 14.2300,  76.4000),
(15, 'Holalkere PS',            'KA-CD-002', 'Main Road, Holalkere',                '08193-220200', 14.0400,  76.1800),

-- Dakshina Kannada (16)
(16, 'Mangaluru City PS',       'KA-DK-001', 'Lalbagh, Mangaluru',                  '0824-2220100', 12.8700,  74.8800),
(16, 'Puttur PS',               'KA-DK-002', 'Main Road, Puttur',                   '08251-220200', 12.7600,  75.2000),

-- Davanagere (17)
(17, 'Davanagere City PS',      'KA-DV-001', 'PJ Extension, Davanagere',            '08192-220100', 14.4700,  75.9200),
(17, 'Harihar PS',              'KA-DV-002', 'Station Road, Harihar',               '08192-220300', 14.5200,  75.7200),

-- Dharwad (18)
(18, 'Dharwad City PS',         'KA-DW-001', 'Sadar Bazaar, Dharwad',               '0836-2220100', 15.4600,  75.0100),
(18, 'Hubli PS',                'KA-DW-002', 'Lamington Road, Hubballi',            '0836-2220200', 15.3600,  75.1200),

-- Gadag (19)
(19, 'Gadag PS',                'KA-GG-001', 'Station Road, Gadag',                 '08372-220100', 15.4200,  75.6300),
(19, 'Nargund PS',              'KA-GG-002', 'Main Road, Nargund',                  '08373-220200', 15.7200,  75.3900),

-- Hassan (20)
(20, 'Hassan City PS',          'KA-HS-001', 'BM Road, Hassan',                     '08172-220100', 13.0000,  76.1000),
(20, 'Arsikere PS',             'KA-HS-002', 'Station Road, Arsikere',              '08174-220200', 13.3100,  76.2500),

-- Haveri (21)
(21, 'Haveri PS',               'KA-HV-001', 'Station Road, Haveri',                '08375-220100', 14.7900,  75.4000),
(21, 'Ranebennur PS',           'KA-HV-002', 'Main Road, Ranebennur',               '08373-220300', 14.6200,  75.6300),

-- Kalaburagi (22)
(22, 'Kalaburagi City PS',      'KA-KL-001', 'Super Market, Kalaburagi',            '08472-220100', 17.3300,  76.8200),
(22, 'Afzalpur PS',             'KA-KL-002', 'Main Road, Afzalpur',                 '08471-220200', 17.1900,  76.3600),

-- Kodagu (23)
(23, 'Madikeri PS',             'KA-KD-001', 'School Road, Madikeri',               '08272-220100', 12.4200,  75.7400),
(23, 'Virajpet PS',             'KA-KD-002', 'Main Road, Virajpet',                 '08274-220200', 12.1700,  75.8100),

-- Kolar (24)
(24, 'Kolar City PS',           'KA-KR-001', 'MG Road, Kolar',                      '08152-220100', 13.1400,  78.1300),
(24, 'KGF PS',                  'KA-KR-002', 'Gold Field Road, KGF',                '08153-220200', 12.9600,  78.2700),

-- Koppal (25)
(25, 'Koppal PS',               'KA-KP-001', 'Station Road, Koppal',                '08539-220100', 15.3500,  76.1500),
(25, 'Gangavathi PS',           'KA-KP-002', 'Main Road, Gangavathi',               '08533-220200', 15.4300,  76.5300),

-- Mandya (26)
(26, 'Mandya City PS',          'KA-MD-001', 'MG Road, Mandya',                     '08232-220100', 12.5200,  76.8900),
(26, 'Maddur PS',               'KA-MD-002', 'Station Road, Maddur',                '08234-220200', 12.5800,  77.0400),

-- Mysuru (27)
(27, 'Mysuru City PS',          'KA-MY-001', 'Nazarbad, Mysuru',                    '0821-2420100', 12.3000,  76.6500),
(27, 'Nanjangud PS',            'KA-MY-002', 'Temple Road, Nanjangud',              '08221-220200', 12.1100,  76.6800),

-- Raichur (28)
(28, 'Raichur City PS',         'KA-RC-001', 'Station Road, Raichur',               '08532-220100', 16.2100,  77.3600),
(28, 'Sindhanur PS',            'KA-RC-002', 'Main Road, Sindhanur',                '08535-220200', 15.7700,  76.7500),

-- Ramanagara (29)
(29, 'Ramanagara PS',           'KA-RN-001', 'BM Road, Ramanagara',                 '08027-220100', 12.7200,  77.2800),
(29, 'Channapatna PS',          'KA-RN-002', 'Mysore Road, Channapatna',            '08027-220200', 12.6500,  77.2100),

-- Shivamogga (30)
(30, 'Shivamogga City PS',      'KA-SM-001', 'JC Road, Shivamogga',                 '08182-220100', 13.9300,  75.5700),
(30, 'Bhadravati PS',           'KA-SM-002', 'Station Road, Bhadravati',            '08182-220300', 13.8500,  75.7000),

-- Tumakuru (31)
(31, 'Tumakuru City PS',        'KA-TK-001', 'BH Road, Tumakuru',                   '0816-2220100', 13.3400,  77.1000),
(31, 'Tiptur PS',               'KA-TK-002', 'Station Road, Tiptur',                '08134-220200', 13.2600,  76.4800),

-- Udupi (32)
(32, 'Udupi PS',                'KA-UD-001', 'Court Road, Udupi',                   '0820-2220100', 13.3400,  74.7400),
(32, 'Kundapura PS',            'KA-UD-002', 'NH 66, Kundapura',                    '08254-220200', 13.6200,  74.6900),

-- Uttara Kannada (33)
(33, 'Karwar PS',               'KA-UK-001', 'Port Road, Karwar',                   '08382-220100', 14.8100,  74.1300),
(33, 'Sirsi PS',                'KA-UK-002', 'Main Road, Sirsi',                    '08384-220200', 14.6200,  74.8400),

-- Vijayapura (34)
(34, 'Vijayapura City PS',      'KA-VP-001', 'Station Road, Vijayapura',            '08352-220100', 16.8300,  75.7200),
(34, 'Indi PS',                 'KA-VP-002', 'Main Road, Indi',                     '08359-220200', 17.1800,  75.9500),

-- Vijayanagara (35)
(35, 'Hosapete PS',             'KA-VN-001', 'Station Road, Hosapete',              '08394-220100', 15.2700,  76.3900),
(35, 'Hagaribommanahalli PS',   'KA-VN-002', 'Main Road, Hagaribommanahalli',       '08395-220200', 15.0400,  76.2100),

-- Yadgir (36)
(36, 'Yadgir PS',               'KA-YD-001', 'Station Road, Yadgir',                '08473-220100', 16.7700,  77.1400),
(36, 'Shorapur PS',             'KA-YD-002', 'Main Road, Shorapur',                 '08474-220200', 16.5200,  76.7600)

ON DUPLICATE KEY UPDATE name = VALUES(name), phone = VALUES(phone);

SET FOREIGN_KEY_CHECKS = 1;

-- Result: 30 Karnataka districts (IDs 7–36) + 60 police stations
