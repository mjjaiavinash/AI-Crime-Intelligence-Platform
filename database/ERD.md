# Database ERD — AI Crime Intelligence Platform

## Entity Relationship Diagram

```
┌─────────────┐        ┌──────────────────┐        ┌──────────────────┐
│    roles    │◄───────│      users       │────────►│    officers      │
│─────────────│  N:1   │──────────────────│  1:1   │──────────────────│
│ id (PK)     │        │ id (PK)          │        │ id (PK)          │
│ name        │        │ role_id (FK)     │        │ user_id (FK,UQ)  │
│ description │        │ username (UQ)    │        │ station_id (FK)  │
└─────────────┘        │ email (UQ)       │        │ district_id (FK) │
                       │ hashed_password  │        │ badge_number(UQ) │
                       │ full_name        │        │ rank             │
                       └──────────────────┘        └────────┬─────────┘
                                                            │
                       ┌──────────────────┐                │
                       │    districts     │◄───────────────┤
                       │──────────────────│                │
                       │ id (PK)          │◄──────┐        │
                       │ name             │       │        │
                       │ state            │  ┌────┴──────────────────┐
                       │ latitude         │  │   police_stations     │
                       │ longitude        │  │───────────────────────│
                       └──────────────────┘  │ id (PK)               │
                                             │ district_id (FK)      │
                                             │ name                  │
                                             │ station_code (UQ)     │
                                             └───────────┬───────────┘
                                                         │
┌─────────────────┐    ┌──────────────────────────────────────────────┐
│  crime_types    │    │                    fir                        │
│─────────────────│    │──────────────────────────────────────────────│
│ id (PK)         │◄───│ id (PK)                                      │
│ category        │    │ fir_number (UQ)                              │
│ name (UQ)       │    │ station_id (FK) ──────────────► police_stations│
│ ipc_section     │    │ district_id (FK) ─────────────► districts    │
│ severity        │    │ crime_type_id (FK) ────────────► crime_types  │
│ is_cognizable   │    │ io_officer_id (FK) ────────────► officers     │
│ is_bailable     │    │ filed_by_officer_id (FK) ──────► officers     │
└─────────────────┘    │ title, description                           │
         ▲             │ incident_date, reported_date                 │
         │             │ latitude, longitude                          │
         │             │ status (ENUM)                                │
┌────────┴────────┐    └──────────────────┬───────────────────────────┘
│ fir_crime_types │◄─────────────────────┘│
│ (junction M:N)  │                        │
│─────────────────│         ┌──────────────┼──────────────────────────┐
│ fir_id (FK)     │         │              │                          │
│ crime_type_id   │         ▼              ▼                          ▼
│ is_primary      │  ┌──────────┐  ┌──────────────┐  ┌──────────────────┐
└─────────────────┘  │ victims  │  │  suspects    │  │   evidence       │
                     │──────────│  │──────────────│  │──────────────────│
                     │ id (PK)  │  │ id (PK)      │  │ id (PK)          │
                     │ fir_id   │  │ full_name    │  │ fir_id (FK)      │
                     │ full_name│  │ alias        │  │ evidence_type    │
                     │ gender   │  │ threat_level │  │ title            │
                     │ injury   │  │ arrest_status│  │ file_path        │
                     └──────────┘  │ gang_affil.  │  │ status           │
                                   └──────┬───────┘  └──────────────────┘
                                          │
                    ┌─────────────────────┼──────────────────────┐
                    │                     │                       │
                    ▼                     ▼                       ▼
           ┌──────────────┐    ┌──────────────────┐   ┌──────────────────┐
           │  suspect_fir │    │  crime_history   │   │    vehicles      │
           │  (M:N junc.) │    │──────────────────│   │──────────────────│
           │──────────────│    │ id (PK)          │   │ id (PK)          │
           │ suspect_id   │    │ suspect_id (FK)  │   │ suspect_id (FK)  │
           │ fir_id       │    │ crime_type_id(FK)│   │ fir_id (FK)      │
           │ role_in_case │    │ outcome          │   │ reg_number       │
           └──────────────┘    │ sentence         │   │ status           │
                               └──────────────────┘   └──────────────────┘

           ┌──────────────────┐              ┌──────────────────────┐
           │  bank_accounts   │              │   mobile_numbers     │
           │──────────────────│              │──────────────────────│
           │ id (PK)          │              │ id (PK)              │
           │ suspect_id (FK)  │              │ suspect_id (FK)      │
           │ fir_id (FK)      │              │ fir_id (FK)          │
           │ account_number   │              │ mobile_number        │
           │ freeze_status    │              │ imei_number          │
           └──────────────────┘              │ surveillance_flag    │
                                             └──────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                         investigation                                 │
│──────────────────────────────────────────────────────────────────────│
│ id (PK)                                                              │
│ fir_id (FK, UQ) ──────────────────────────────────────────► fir     │
│ lead_officer_id (FK) ─────────────────────────────────────► officers│
│ supervisor_id (FK) ───────────────────────────────────────► officers│
│ status, outcome, start_date, target_close_date                       │
└──────────────────────┬───────────────────────────────────────────────┘
                       │
          ┌────────────┴────────────────┐
          ▼                             ▼
┌──────────────────────┐    ┌──────────────────────────┐
│ investigation_officers│    │  investigation_notes     │
│──────────────────────│    │──────────────────────────│
│ investigation_id (FK)│    │ id (PK)                  │
│ officer_id (FK)      │    │ investigation_id (FK)    │
│ role                 │    │ officer_id (FK)          │
└──────────────────────┘    │ note, note_type          │
                            └──────────────────────────┘
```

## Table Summary

| Table                   | Rows (est.) | Purpose                                      |
|-------------------------|-------------|----------------------------------------------|
| roles                   | ~5          | Access control roles                         |
| districts               | ~100        | Administrative jurisdictions                 |
| police_stations         | ~500        | Physical stations per district               |
| users                   | ~1,000      | Platform login accounts                      |
| officers                | ~800        | Officer profiles linked to users             |
| crime_types             | ~50         | IPC/BNS section lookup                       |
| fir                     | ~100,000    | Central FIR hub                              |
| fir_crime_types         | ~150,000    | FIR ↔ crime type M:N                         |
| victims                 | ~120,000    | Victims per FIR                              |
| suspects                | ~80,000     | Suspect profiles                             |
| suspect_fir             | ~100,000    | Suspect ↔ FIR M:N                            |
| crime_history           | ~60,000     | Prior criminal records                       |
| vehicles                | ~40,000     | Vehicles linked to suspects/FIRs             |
| bank_accounts           | ~30,000     | Financial intelligence                       |
| mobile_numbers          | ~50,000     | Telecom intelligence                         |
| evidence                | ~200,000    | Evidence items per FIR                       |
| investigation           | ~100,000    | Investigation lifecycle (1:1 with FIR)       |
| investigation_officers  | ~150,000    | Officers assigned to investigations          |
| investigation_notes     | ~500,000    | Investigation diary entries                  |

## Key Relationships

- `fir` is the **central hub** — every domain table links back to it
- `suspects` ↔ `fir` is **M:N** via `suspect_fir` (one suspect, many FIRs)
- `fir` ↔ `crime_types` is **M:N** via `fir_crime_types` (one FIR, multiple charges)
- `investigation` is **1:1** with `fir`
- `officers` is **1:1** with `users` (every officer has a login account)
- All asset tables (`vehicles`, `bank_accounts`, `mobile_numbers`) link to both `suspects` AND `fir`
