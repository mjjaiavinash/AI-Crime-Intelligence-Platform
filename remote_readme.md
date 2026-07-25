<div align="center">

#  CrimeIQ — AI Crime Intelligence Platform

### Built for Karnataka State Police · Datathon Project

[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react)](https://react.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=flat&logo=mysql&logoColor=white)](https://mysql.com)
[![Groq](https://img.shields.io/badge/Groq-LLaMA--3-F55036?style=flat)](https://console.groq.com)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=flat&logo=tailwindcss)](https://tailwindcss.com)

> An AI-powered, full-stack crime intelligence platform that brings together real-time analytics, RAG-based chat, machine learning predictions, network graph visualization, and secure case management — all in one unified system for law enforcement.

</div>

---

##  Table of Contents

- [Overview](#-overview)
- [Screenshots](#-screenshots)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [User Roles](#-user-roles)
- [ML Models](#-ml-models)
- [API Documentation](#-api-documentation)
- [Environment Variables](#-environment-variables)
- [Demo Credentials](#-demo-credentials)

---

##  Overview

CrimeIQ is a comprehensive crime intelligence platform designed for the Karnataka State Police. It addresses the challenge of fragmented crime data by providing a single, secure platform where investigators, analysts, supervisors, and administrators can collaborate, analyze, and act on crime intelligence in real time.

The platform combines:
- **Traditional case management** (FIRs, suspects, victims, evidence)
- **AI-powered intelligence** (Groq LLaMA-3 RAG chat, case summaries)
- **Machine learning predictions** (hotspot detection, repeat offender risk, crime classification)
- **Visual analytics** (network graphs, heatmaps, trend charts, forecasting)

---

##  Features

###  Authentication & Security
- JWT-based authentication with access + refresh tokens
- Role-based access control (4 roles with different permissions)
- Account enable/disable by admin
- All sessions monitored and logged
- Rate limiting and error handling middleware

###  Case Management (Investigator)
- **FIR Management** — File, view, search, and paginate First Information Reports
- **Cases** — Track all cases with status (Filed → Under Investigation → Closed)
- **Suspects** — Register suspect profiles with threat levels, arrest status, gang affiliations
- **Victims** — Record victim details with injury classification and anonymous option
- **Evidence** — Chain of custody tracking from collection → lab → filing

###  AI Features
- **AI Investigation Assistant** — Select any FIR and get an AI-generated case intelligence summary using Groq LLaMA-3, analyzing all linked suspects, victims, and evidence
- **RAG Chat** — Ask natural language questions about crime data in English or Kannada. Powered by Groq LLaMA-3 + ChromaDB vector store
- **Voice Input** — Hold-to-speak microphone input in both English and Kannada
- **Text-to-Speech** — AI responses can be read aloud
- **PDF Export** — Export chat sessions as PDF reports

###  Analytics (Crime Analyst)
- **Dashboard** — Monthly crime trends, crime-by-type breakdown
- **Heatmaps** — Geographic crime density visualization
- **Trends** — Time-series analysis across districts and crime types
- **Forecasting** — Predictive crime volume forecasting
- **Sociological Analysis** — Demographic and socioeconomic crime correlations
- **Network Analysis** — Analyst-level network graph exploration

###  Machine Learning (Crime Analyst)
- **Crime Hotspot Detection** — DBSCAN clustering to identify high-crime geographic zones
- **Repeat Offender Prediction** — Random Forest model to predict recidivism likelihood
- **Crime Classification** — XGBoost model to classify crime type from incident features
- Model performance evaluation with confusion matrices, ROC curves, SHAP plots

###  Visualization
- **Network Graphs** — Cytoscape.js-powered graphs showing relationships between suspects, victims, FIRs, and officers
- **Crime Maps** — Leaflet.js interactive maps with crime incident markers
- **Financial Network** — Visualize financial connections between suspects

###  Supervisor Features
- State-level crime overview dashboard
- Police station risk assessment (based on real crime counts)
- Officer management and resource allocation
- High-risk zone monitoring
- State-wide crime trend charts

###  Admin Features
- User management — create, enable/disable users across all roles
- Role assignment with pill selector UI
- Crime type management
- Police station and district management
- Audit logs
- System health monitoring (backend, database, Groq, ChromaDB, ML models)

---

##  Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + Vite | SPA framework with fast HMR |
| **Styling** | Tailwind CSS 3.4 | Utility-first dark theme UI |
| **Charts** | Recharts | Bar, line, area charts |
| **Maps** | Leaflet + React-Leaflet | Interactive crime maps |
| **Graphs** | Cytoscape.js | Network relationship graphs |
| **State** | Zustand | Lightweight auth state management |
| **HTTP** | Axios | API calls with JWT interceptors |
| **Markdown** | react-markdown | AI response rendering |
| **Backend** | Python FastAPI | High-performance async API |
| **ORM** | SQLAlchemy | Database models and queries |
| **Database** | MySQL 8.0 (PyMySQL) | Primary data store |
| **Auth** | JWT (python-jose) | Access + refresh token auth |
| **AI / LLM** | Groq LLaMA-3.3-70B | Case summaries and RAG chat |
| **Vector DB** | ChromaDB | RAG document embeddings |
| **Embeddings** | Sentence Transformers | Text embedding for RAG |
| **ML** | XGBoost + Random Forest | Crime prediction models |
| **Clustering** | DBSCAN (scikit-learn) | Hotspot detection |
| **Anomaly** | Isolation Forest | Anomalous incident detection |
| **PDF** | jsPDF + html2canvas | Report and chat export |

---

##  Project Structure

```
ai-crime-intelligence-platform/
│
├──  backend/                        # FastAPI application
│   ├──  api/v1/routes/              # REST API endpoints
│   │   ├── auth.py                    # Login, register, user management
│   │   ├── fir.py                     # FIR CRUD operations
│   │   ├── suspects.py                # Suspect management
│   │   ├── victims.py                 # Victim management
│   │   ├── evidence.py                # Evidence chain of custody
│   │   ├── analytics.py               # Summary, trends, by-type stats
│   │   ├── chat.py                    # RAG chat streaming endpoint
│   │   ├── assistant.py               # AI case summary endpoint
│   │   ├── ml.py                      # ML prediction endpoints
│   │   ├── voice.py                   # Text-to-speech endpoint
│   │   ├── police_stations.py         # Station management
│   │   ├── officers.py                # Officer management
│   │   └── reports.py                 # Report generation
│   │
│   ├──  core/                       # App configuration
│   │   ├── config.py                  # Settings with lru_cache
│   │   ├── database.py                # SQLAlchemy engine + session
│   │   ├── security.py                # Password hashing, JWT
│   │   ├── exceptions.py              # Custom exception classes
│   │   └── logging.py                 # Structured logging setup
│   │
│   ├──  middleware/                 # Request/response middleware
│   │   ├── auth_middleware.py         # JWT validation middleware
│   │   ├── rate_limit.py              # API rate limiting
│   │   ├── error_handler.py           # Global error handling
│   │   └── logging_middleware.py      # Request logging
│   │
│   ├──  models/                     # SQLAlchemy ORM models
│   │   ├── user.py                    # User accounts
│   │   ├── fir.py                     # First Information Reports
│   │   ├── suspect.py                 # Suspect profiles
│   │   ├── victim.py                  # Victim records
│   │   ├── evidence.py                # Evidence items
│   │   ├── crime.py                   # Crime incidents
│   │   ├── officer.py                 # Police officers
│   │   ├── police_station.py          # Police stations
│   │   └── investigation.py           # Investigation records
│   │
│   ├──  schemas/                    # Pydantic request/response models
│   ├──  services/                   # Business logic layer
│   ├──  utils/                      # Helper functions
│   ├── main.py                        # FastAPI app entry point
│   ├── .env.example                   # Environment variable template
│   └── Dockerfile                     # Docker configuration
│
├──  frontend/                       # React + Vite application
│   ├──  public/
│   │   ├── Background_image.png       # Login page background
│   │   └── favicon.svg                # Shield icon favicon
│   │
│   └──  src/
│       ├──  components/
│       │   ├──  common/             # Reusable UI components
│       │   │   ├── StatCard.jsx       # Metric cards with trend badges
│       │   │   ├── Table.jsx          # Data table with skeleton loading
│       │   │   ├── Modal.jsx          # Accessible modal dialog
│       │   │   ├── PageHeader.jsx     # Page title with accent bar
│       │   │   ├── Badge.jsx          # Status/role color badges
│       │   │   └── Spinner.jsx        # Loading spinner
│       │   ├──  layout/
│       │   │   ├── Navbar.jsx         # Top nav with notifications
│       │   │   ├── sidebars/          # Role-specific sidebars (4 roles)
│       │   │   └── *Layout.jsx        # Layout wrappers per role
│       │   ├──  charts/             # Recharts wrappers
│       │   ├──  map/                # Leaflet crime map
│       │   └──  graph/              # Cytoscape network graph
│       │
│       ├──  pages/
│       │   ├──  auth/               # Login page
│       │   ├──  admin/              # Admin dashboard, users, settings
│       │   ├──  investigator/       # FIR, cases, suspects, evidence, victims
│       │   │                          # AI assistant, network, timeline
│       │   ├──  analyst/            # ML, trends, heatmaps, forecasting
│       │   └──  supervisor/         # State overview, officers, high-risk
│       │
│       ├──  services/               # Axios API service layer
│       ├──  store/                  # Zustand auth store
│       └──  utils/                  # helpers.js, exportPDF.js
│
├──  ai/                             # AI / RAG layer
│   ├──  groq/                       # Groq LLM client wrapper
│   ├──  rag/                        # ChromaDB ingestion + retrieval
│   │   ├── ingestion.py               # Document ingestion pipeline
│   │   ├── retriever.py               # Semantic search retriever
│   │   ├── chroma_client.py           # ChromaDB client setup
│   │   └── seed_knowledge.py          # Seed initial knowledge base
│   ├──  embeddings/                 # Sentence transformer embedder
│   ├──  pipelines/                  # RAG and report pipelines
│   └──  prompts/                    # LLM prompt templates
│
├──  ml/                             # Machine learning
│   ├──  models/                     # Trained .pkl model files
│   │   ├── crime_classifier_model.pkl # XGBoost crime classifier
│   │   ├── hotspot_model.pkl          # Hotspot prediction model
│   │   └── repeat_offender_model.pkl  # Recidivism prediction model
│   ├──  training/                   # Model training scripts
│   ├──  inference/                  # Prediction scripts
│   ├──  preprocessing/              # Data preprocessing pipelines
│   └──  evaluation/                 # Confusion matrices, ROC, SHAP plots
│
├──  database/                       # Database layer
│   ├──  migrations/                 # SQL migration files (001–008)
│   ├──  seeds/                      # Sample data for development
│   ├──  queries/                    # Analytics SQL queries
│   └── ERD.md                         # Entity Relationship Diagram
│
├──  auth/                           # JWT token utilities
├──  config/                         # Logging and alembic config
├──  docs/                           # API reference + architecture docs
├── .env.example                       # Root environment template
├── .gitignore                         # Comprehensive ignore rules
├── .gitattributes                     # Line ending normalization
├── requirements.txt                   # Python dependencies
└── README.md                          # This file
```

---

##  Getting Started

### Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Python | 3.9+ | 3.11 recommended |
| Node.js | 18+ | For frontend |
| MySQL | 8.0+ | Primary database |
| Groq API Key | — | Free at [console.groq.com](https://console.groq.com) |

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/mjjaiavinash/AI-Crime-Intelligence-Platform.git
cd AI-Crime-Intelligence-Platform
```

---

### Step 2 — Set up MySQL database

```sql
-- Run in MySQL client
CREATE DATABASE crime_intelligence
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Then run migrations in order:

```bash
mysql -u root -p crime_intelligence < database/migrations/001_initial_schema.sql
mysql -u root -p crime_intelligence < database/migrations/002_users_officers.sql
mysql -u root -p crime_intelligence < database/migrations/003_crime_types_fir.sql
mysql -u root -p crime_intelligence < database/migrations/004_persons.sql
mysql -u root -p crime_intelligence < database/migrations/005_assets.sql
mysql -u root -p crime_intelligence < database/migrations/006_evidence_investigation.sql
mysql -u root -p crime_intelligence < database/migrations/007_indexes.sql
mysql -u root -p crime_intelligence < database/migrations/008_views.sql

# Load sample data
mysql -u root -p crime_intelligence < database/seeds/sample_data.sql
```

---

### Step 3 — Configure environment variables

```bash
cp .env.example backend/.env
```

Open `backend/.env` and fill in your values:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=crime_intelligence
DB_USER=root
DB_PASSWORD=your_mysql_password

JWT_SECRET=generate_a_long_random_string_here
JWT_ALGORITHM=HS256
JWT_ACCESS_EXPIRE_MINUTES=60

GROQ_API_KEY=your_groq_api_key_from_console_groq_com
GROQ_MODEL=llama-3.3-70b-versatile

CHROMA_PERSIST_DIR=../database/chromadb
ALLOWED_ORIGINS=["http://localhost:5173"]
```

> **Generate JWT_SECRET:**
> ```bash
> python -c "import secrets; print(secrets.token_hex(32))"
> ```

---

### Step 4 — Install Python dependencies

```bash
# From project root
pip install -r requirements.txt
```

---

### Step 5 — Set up user passwords

```bash
# From project root — sets bcrypt passwords for all seed users
python backend/fix_passwords.py
```

---

### Step 6 — Seed the RAG knowledge base (run once)

```bash
# From project root — loads crime intelligence documents into ChromaDB
python ai/rag/seed_knowledge.py
```

---

### Step 7 — Start the backend

```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- API runs at: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

### Step 8 — Start the frontend

```bash
cd frontend
npm install
npm run dev
```

- App runs at: `http://localhost:5173`
- Automatically proxies `/api` → `http://localhost:8000`

---

##  User Roles

| Role | Username | Password | Access |
|------|----------|----------|--------|
| **Administrator** | `admin` | `admin1234` | Full system access — user management, all data, system settings, audit logs |
| **Supervisor** | `supervisor1` | `admin1234` | State-level overview, officer management, high-risk zones, resource allocation |
| **Investigator** | `invest1` | `officer1234` | FIR filing, suspect/victim/evidence management, AI assistant, network graphs |
| **Investigator** | `invest2` | `officer1234` | Same as above — second investigator account |
| **Crime Analyst** | `analyst1` | `officer1234` | Analytics, ML predictions, heatmaps, trends, forecasting |

### Role Permissions Detail

```
admin
 ├── Manage all users (create, enable/disable, change roles)
 ├── View all FIRs, suspects, victims, evidence
 ├── Manage crime types, police stations, districts
 ├── View audit logs and system health
 └── Access all reports

supervisor
 ├── View state-level crime dashboard
 ├── Monitor all police stations with risk levels
 ├── Manage officers and resource allocation
 ├── View high-risk zones and alerts
 └── Generate state-level reports

investigator
 ├── File and manage FIRs
 ├── Add/view suspects, victims, evidence
 ├── Use AI Investigation Assistant (case summaries)
 ├── View network graphs and financial networks
 ├── View case timeline
 └── Generate investigation reports

crime_analyst
 ├── View analytics dashboards (trends, heatmaps)
 ├── Run ML predictions (hotspot, repeat offender, classifier)
 ├── Access forecasting and sociological analysis
 ├── Use RAG chat for intelligence queries
 └── Generate analytical reports
```

---

##  ML Models

Three machine learning models are pre-trained and included:

### 1. Crime Hotspot Detection
- **Algorithm:** DBSCAN (Density-Based Spatial Clustering)
- **Input:** Latitude, longitude, time, crime type
- **Output:** Cluster assignments identifying high-crime geographic zones
- **File:** `ml/models/hotspot_model.pkl`

### 2. Repeat Offender Prediction
- **Algorithm:** Random Forest Classifier
- **Input:** Suspect demographics, prior offenses, crime type, time patterns
- **Output:** Recidivism risk score (Low / Medium / High)
- **File:** `ml/models/repeat_offender_model.pkl`

### 3. Crime Type Classifier
- **Algorithm:** XGBoost Classifier
- **Input:** Incident features (location, time, victim profile, modus operandi)
- **Output:** Predicted crime category
- **File:** `ml/models/crime_classifier_model.pkl`

### Retrain Models

```bash
# Hotspot model
python ml/training/train.py

# Repeat offender model
python ml/training/train_repeat.py

# Crime classifier
python ml/training/train_classifier.py
```

Training datasets are in `ml/Dataset Model/` (Excel files, 100K+ rows each).

---

##  API Documentation

Full interactive API docs available at `http://localhost:8000/docs` when backend is running.

### Key Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/login` | Authenticate and get JWT tokens |
| `GET` | `/api/v1/auth/users` | List all users (admin only) |
| `POST` | `/api/v1/auth/register` | Create new user (admin only) |
| `GET` | `/api/v1/fir` | List FIRs with pagination |
| `POST` | `/api/v1/fir` | File a new FIR |
| `GET` | `/api/v1/suspects` | List suspects with pagination |
| `POST` | `/api/v1/suspects` | Add a suspect |
| `GET` | `/api/v1/victims` | List victims |
| `GET` | `/api/v1/evidence` | List evidence items |
| `GET` | `/api/v1/analytics/summary` | Crime summary stats |
| `GET` | `/api/v1/analytics/trends` | Monthly crime trends |
| `GET` | `/api/v1/analytics/by-type` | Crime counts by type |
| `POST` | `/api/v1/chat` | RAG chat (streaming) |
| `GET` | `/api/v1/assistant/case-summary/{fir_id}` | AI case summary |
| `GET` | `/api/v1/ml/hotspots` | Crime hotspot clusters |
| `GET` | `/api/v1/ml/anomalies` | Anomalous incidents |
| `GET` | `/api/v1/police-stations` | List police stations |

---

##  Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DB_HOST` |  | MySQL host (default: `localhost`) |
| `DB_PORT` |  | MySQL port (default: `3306`) |
| `DB_NAME` |  | Database name (`crime_intelligence`) |
| `DB_USER` |  | MySQL username |
| `DB_PASSWORD` |  | MySQL password |
| `JWT_SECRET` |  | Secret key for JWT signing (min 32 chars) |
| `JWT_ALGORITHM` |  | JWT algorithm (default: `HS256`) |
| `JWT_ACCESS_EXPIRE_MINUTES` |  | Token expiry (default: `60`) |
| `JWT_REFRESH_EXPIRE_DAYS` |  | Refresh token expiry (default: `7`) |
| `GROQ_API_KEY` |  | Groq API key from console.groq.com |
| `GROQ_MODEL` |  | LLM model (default: `llama-3.3-70b-versatile`) |
| `CHROMA_PERSIST_DIR` |  | ChromaDB storage path |
| `ALLOWED_ORIGINS` |  | CORS origins (default: `localhost:5173`) |
| `UPLOAD_DIR` |  | File upload directory |
| `MAX_UPLOAD_MB` |  | Max upload size in MB (default: `20`) |

---

##  Database Schema

The database has 15+ tables covering:

- `users` — Platform user accounts with roles
- `officers` — Police officer profiles
- `police_stations` — Station registry with district mapping
- `firs` — First Information Reports
- `crimes` — Crime incident records
- `crime_types` — Crime category taxonomy
- `suspects` — Suspect profiles with threat levels
- `victims` — Victim records
- `evidence` — Evidence chain of custody
- `investigations` — Investigation tracking
- `crime_history` — Suspect criminal history
- `vehicles` — Vehicle records linked to cases
- `bank_accounts` — Financial records for fraud cases
- `mobile_numbers` — Mobile number records

See `database/ERD.md` for the full Entity Relationship Diagram.

---

##  Docker (Backend)

```bash
cd backend
docker build -t crimeiq-backend .
docker run -p 8000:8000 --env-file .env crimeiq-backend
```

---

##  License

This project was built for the **Karnataka State Police Datathon**.  
For educational and demonstration purposes only.

---

<div align="center">

Built with  for Karnataka State Police · CrimeIQ Intelligence Platform

</div>
