# AI Crime Intelligence Platform

A hackathon project that leverages AI, RAG, and interactive visualizations to analyze and surface crime intelligence insights.

## Tech Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Frontend       | React (Vite) + Tailwind CSS       |
| Backend        | Python FastAPI                    |
| Database       | MySQL + ChromaDB (vector store)   |
| AI             | Groq API + ChromaDB RAG           |
| Visualization  | Leaflet Maps, Cytoscape.js, Recharts |
| Auth           | JWT                               |

## Project Structure

```
ai-crime-intelligence-platform/
├── frontend/       # React Vite app
├── backend/        # FastAPI server
├── ai/             # RAG pipelines and Groq integration
├── ml/             # ML models and training scripts
├── database/       # Migrations, seeds, queries
├── auth/           # JWT auth logic
├── uploads/        # User-uploaded files
├── reports/        # Generated reports
├── static/         # Static assets
├── config/         # Environment and app configuration
└── docs/           # Documentation
```

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
