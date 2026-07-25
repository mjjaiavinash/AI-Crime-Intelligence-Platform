"""
api/v1/routes/analytics.py
───────────────────────────
All analytics endpoints require authentication.
crime_analyst role has read access to all analytics.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user
from schemas.analytics import AnalyticsSummary, NetworkGraph, HotspotPoint, TrendPoint, CrimeTypeCount, EarlyWarningAlert, DistrictStat, SociologicalInsights
from services import analytics_service

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("/summary", response_model=AnalyticsSummary,
            summary="Dashboard summary — all roles")
def summary(db: Session = Depends(get_db)):
    return analytics_service.get_summary(db)


@router.get("/hotspots", response_model=list[HotspotPoint],
            summary="Crime hotspots — all roles")
def hotspots(db: Session = Depends(get_db)):
    return analytics_service.get_hotspots(db)


@router.get("/trends", response_model=list[TrendPoint],
            summary="Monthly trends — all roles")
def trends(db: Session = Depends(get_db)):
    return analytics_service.get_trends(db)


@router.get("/by-type", response_model=list[CrimeTypeCount],
            summary="Crime by type — all roles")
def by_type(db: Session = Depends(get_db)):
    return analytics_service.get_by_type(db)


@router.get("/network", response_model=NetworkGraph,
          summary="Suspect network graph — all roles")
def network_graph(db: Session = Depends(get_db)):
    return analytics_service.get_network_graph(db)


@router.get("/alerts", response_model=list[EarlyWarningAlert],
            summary="Early warning alerts — analyst/supervisor")
def alerts(db: Session = Depends(get_db)):
    return analytics_service.get_alerts(db)


@router.get("/by-district", response_model=list[DistrictStat],
            summary="Crime counts per district")
def by_district(db: Session = Depends(get_db)):
    return analytics_service.get_by_district(db)


@router.get("/sociological", response_model=SociologicalInsights,
            summary="Sociological insights — real DB aggregations")
def sociological(db: Session = Depends(get_db)):
    return analytics_service.get_sociological(db)
