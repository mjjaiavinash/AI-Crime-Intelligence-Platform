# CrimeIQ — AI Crime Intelligence Platform

> AI-powered crime intelligence platform built for **Karnataka State Police**.  
> Real-time analytics, RAG-based chat, ML predictions, network graphs, and secure case management — all in one platform.

---

## Features

- **Role-based access** — Admin, Supervisor, Investigator, Crime Analyst
- **FIR & Case Management** — File, track, and manage First Information Reports
- **Suspect & Victim Registry** — Linked profiles with threat levels and injury records
- **Evidence Chain of Custody** — Track evidence from collection to lab to filing
- **AI Investigation Assistant** — Groq LLaMA-3 generates case summaries from linked data
- **RAG Chat** — Ask questions about crime data in English or Kannada (voice enabled)
- **ML Predictions** — Crime hotspot clustering, repeat offender detection, crime classification
- **Analytics Dashboards** — Trends, heatmaps, district breakdowns, forecasting
- **Network Graphs** — Visualize suspect/victim/FIR relationships
- **PDF Export** — Export reports and chat sessions

---

## Tech Stack

| Layer         | Technology                                          |
|---------------|-----------------------------------------------------|
| Frontend      | React 18 + Vite + Tailwind CSS + Recharts + Leaflet |
| Backend       | Python FastAPI + SQLAlchemy + MySQL (PyMySQL)        |
| AI / RAG      | Groq LLaMA-3 + Sentence Transformers + ChromaDB     |
| ML Models     | XGBoost + Random Forest + DBSCAN + Isolation Forest |
| Auth          | JWT (access + refresh tokens, role-based)           |
| Visualization | Cytoscape.js (network), Leaflet (maps), Recharts    |

---

## Project Structure

```
ai-crime-intelligence-platform/
│
├── backend/                  # FastAPI application (run from here)
│   ├── api/v1/routes/        # All API route handlers
│   ├── core/                 # Config, database, security, logging
│   ├── middleware/           # Auth, rate limiting, error handling
│   ├── models/               # SQLAlchemy ORM models
│   ├── schemas/              # Pydantic request/response schemas
│   ├── services/             # Business logic layer
│   ├── utils/                # Helper utilities
│   ├── main.py               # FastAPI app entry point
│   ├── .env.example          # Environment variable template
│   └── Dockerfile            # Docker config for backend
│
├── frontend/                 # React + Vite application
│   ├── public/               # Static assets (favicon, background)
│   └── src/
│       ├── components/       # Reusable UI components
│       │   ├── common/       # StatCard, Table, Modal, PageHeader, etc.
│       │   ├── charts/       # Bar and line chart wrappers
│       │   ├── layout/       # Navbar, Sidebars, Layout wrappers
│       │   ├── map/          # Leaflet crime map
│       │   └── graph/        # Cytoscape network graph
│       ├── pages/            # Page components by role
│       │   ├── admin/        # Admin dashboard, users, settings
│       │   ├── investigator/ # FIR, cases, suspects, evidence, victims
│       │   ├── analyst/      # ML, trends, heatmaps, forecasting
│       │   └── supervisor/   # State overview, officers, high-risk
│       ├── services/         # Axios API service calls
│       ├── store/            # Zustand auth store
│       └── utils/            # Helpers, PDF export, text cleaning
│
├── ai/                       # AI / RAG layer
│   ├── groq/                 # Groq LLM client
│   ├── rag/                  # ChromaDB ingestion, retrieval, seeding
│   ├── embeddings/           # Sentence transformer embedder
│   ├── pipelines/            # RAG and report pipelines
│   └── prompts/              # LLM prompt templates
│
├── ml/                       # Machine learning
│   ├── models/               # Trained .pkl model files
│   ├── training/             # Training scripts
│   ├── inference/            # Prediction scripts
│   ├── preprocessing/        # Data preprocessing
│   └── evaluation/           # Evaluation plots and scripts
│
├── database/                 # Database layer
│   ├── migrations/           # SQL migration files (run in order)
│   ├── seeds/                # Sample data for development
│   ├── queries/              # Analytics SQL queries
│   └── ERD.md                # Entity Relationship Diagram
│
├── auth/                     # JWT token utilities
├── config/                   # Logging and alembic config
├── docs/                     # API reference and architecture docs
├── static/                   # Fonts, icons, images
├── uploads/                  # File upload storage
├── requirements.txt          # Python dependencies
└── .env.example              # Environment variable template
```

---

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- MySQL 8.0+
- A [Groq API key](https://console.groq.com) (free)

---

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-crime-intelligence-platform.git
cd ai-crime-intelligence-platform
```

---

### 2. Set up the database

Create a MySQL database and run migrations in order:

```sql
CREATE DATABASE crime_intelligence CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then run each file in `database/migrations/` in numbered order (001 → 008), followed by seeds:

```bash
mysql -u root -p crime_intelligence < database/migrations/001_initial_schema.sql
mysql -u root -p crime_intelligence < database/migrations/002_users_officers.sql
# ... continue through 008
mysql -u root -p crime_intelligence < database/seeds/sample_data.sql
```

---

### 3. Configure environment variables

```bash
cp .env.example backend/.env
```

Edit `backend/.env` and fill in:

```env
DB_PASSWORD=your_mysql_password
GROQ_API_KEY=your_groq_api_key
JWT_SECRET=any_long_random_string
```

---

### 4. Install Python dependencies & run backend

```bash
# From project root
pip install -r requirements.txt

# Set initial user passwords
python backend/fix_passwords.py

# Start backend
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at: `http://localhost:8000`  
API docs at: `http://localhost:8000/docs`

---

### 5. Seed the RAG knowledge base (run once)

```bash
# From project root
python ai/rag/seed_knowledge.py
```

---

### 6. Install frontend dependencies & run

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`  
It automatically proxies `/api` requests to the backend.

---

## Demo Login Credentials

| Username      | Password     | Role            |
|---------------|--------------|-----------------|
| admin         | admin1234    | Administrator   |
| supervisor1   | admin1234    | Supervisor      |
| invest1       | officer1234  | Investigator    |
| invest2       | officer1234  | Investigator    |
| analyst1      | officer1234  | Crime Analyst   |

---

## User Roles & Access

| Role           | What they can do                                                    |
|----------------|---------------------------------------------------------------------|
| `admin`        | Manage users, view all data, system settings, audit logs            |
| `supervisor`   | State-level overview, officer management, high-risk zones           |
| `investigator` | File FIRs, manage suspects/victims/evidence, AI assistant, network  |
| `crime_analyst`| Analytics, ML predictions, heatmaps, trends, forecasting           |

---

## ML Models

Three pre-trained models are included in `ml/models/`:

| Model                  | Algorithm      | Purpose                          |
|------------------------|----------------|----------------------------------|
| Crime Hotspot          | DBSCAN         | Cluster high-crime geographic areas |
| Repeat Offender        | Random Forest  | Predict recidivism likelihood    |
| Crime Classifier       | XGBoost        | Classify crime type from features |

To retrain models:

```bash
python ml/training/train.py             # Hotspot
python ml/training/train_repeat.py      # Repeat offender
python ml/training/train_classifier.py  # Crime classifier
```

---

## API Documentation

Full API reference is available at `http://localhost:8000/docs` (Swagger UI) when the backend is running.

Static reference: [`docs/api_reference.md`](docs/api_reference.md)

---

## Environment Variables Reference

| Variable              | Description                          | Required |
|-----------------------|--------------------------------------|----------|
| `DB_HOST`             | MySQL host (default: localhost)      | Yes      |
| `DB_PORT`             | MySQL port (default: 3306)           | Yes      |
| `DB_NAME`             | Database name                        | Yes      |
| `DB_USER`             | MySQL username                       | Yes      |
| `DB_PASSWORD`         | MySQL password                       | Yes      |
| `JWT_SECRET`          | Secret key for JWT signing           | Yes      |
| `JWT_EXPIRE_MINUTES`  | Token expiry in minutes              | No       |
| `GROQ_API_KEY`        | Groq API key for LLM                 | Yes      |
| `CHROMA_PERSIST_DIR`  | ChromaDB storage path                | No       |
| `ALLOWED_ORIGINS`     | CORS allowed origins                 | No       |

---

## License

This project was built for the **Karnataka State Police Datathon**.  
For educational and demonstration purposes only.
