from fastapi import APIRouter
from api.v1.routes import (
    auth,
    crime,
    analytics,
    reports,
    fir,
    victims,
    suspects,
    crime_types,
    police_stations,
    officers,
    vehicles,
    bank_accounts,
    mobile_numbers,
    evidence,
    investigations,
    crime_histories,
    chat,
    ml,
    assistant,
    voice,
)

router = APIRouter(prefix="/api/v1")

# ── Auth ──────────────────────────────────────────────────────────────────────
router.include_router(auth.router,            prefix="/auth",            tags=["Auth"])

# ── Conversational RAG AI ─────────────────────────────────────────────────────
router.include_router(chat.router,            prefix="/chat",            tags=["Conversational AI"])
router.include_router(assistant.router,       prefix="/assistant",       tags=["AI Investigation Assistant"])
router.include_router(voice.router,           prefix="/voice",           tags=["Voice Processing"])

# ── Core CRUD ─────────────────────────────────────────────────────────────────
router.include_router(fir.router,             prefix="/fir",             tags=["FIR"])
router.include_router(victims.router,         prefix="/victims",         tags=["Victims"])
router.include_router(suspects.router,        prefix="/suspects",        tags=["Suspects"])
router.include_router(crime_types.router,     prefix="/crime-types",     tags=["Crime Types"])
router.include_router(police_stations.router, prefix="/police-stations", tags=["Police Stations"])
router.include_router(officers.router,        prefix="/officers",        tags=["Officers"])

# ── Assets & Evidence CRUD ────────────────────────────────────────────────────
router.include_router(vehicles.router,        prefix="/vehicles",        tags=["Vehicles"])
router.include_router(bank_accounts.router,   prefix="/bank-accounts",   tags=["Bank Accounts"])
router.include_router(mobile_numbers.router,  prefix="/mobile-numbers",  tags=["Mobile Numbers"])
router.include_router(evidence.router,        prefix="/evidence",        tags=["Evidence"])
router.include_router(investigations.router,  prefix="/investigations",  tags=["Investigations"])
router.include_router(crime_histories.router, prefix="/crime-histories", tags=["Crime History"])

# ── Legacy crimes endpoint (kept for backward compatibility) ──────────────────
router.include_router(crime.router,           prefix="/crimes",          tags=["Crimes (Legacy)"])

# ── Analytics, ML & AI ────────────────────────────────────────────────────────
router.include_router(analytics.router,       prefix="/analytics",       tags=["Analytics"])
router.include_router(reports.router,         prefix="/reports",         tags=["AI Reports"])
router.include_router(ml.router,              prefix="/ml",              tags=["Machine Learning"])
