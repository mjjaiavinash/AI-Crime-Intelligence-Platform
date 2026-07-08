# Architecture overview of the AI Crime Intelligence Platform

## System Architecture

```
Browser (React + Vite)
    │
    ▼
FastAPI Backend  ──────────────────────────────────────────────────────────
    │                │                    │                    │
    ▼                ▼                    ▼                    ▼
MySQL DB       ChromaDB (RAG)       Groq API (LLM)       ML Models
(crimes,       (document            (analysis,            (hotspot,
 users,         vectors)             summarization)        classifier)
 suspects)
```

## Data Flow

1. Officer uploads crime report → stored in MySQL + embedded into ChromaDB
2. Analyst queries AI → RAG retrieves relevant docs → Groq generates insight
3. Dashboard fetches analytics → ML models predict hotspots → Leaflet renders map
4. Network graph built from suspect-crime relationships → Cytoscape.js renders

## API Versioning

All endpoints are prefixed with `/api/v1/`
