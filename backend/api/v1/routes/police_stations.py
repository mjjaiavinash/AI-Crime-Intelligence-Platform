from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user, require_role
from schemas.police_station import (
    PoliceStationCreate, PoliceStationUpdate,
    PoliceStationRead, PoliceStationSummary,
)
from schemas.base import PaginatedResponse
from services import police_station_service

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("", response_model=PaginatedResponse[PoliceStationSummary],
            summary="List all police stations")
def list_stations(
    page:        int           = Query(1,  ge=1),
    page_size:   int           = Query(20, ge=1, le=100),
    district_id: Optional[int] = Query(None, description="Filter by district"),
    is_active:   Optional[bool]= Query(None, description="Filter by active status"),
    db: Session = Depends(get_db),
):
    return police_station_service.list_stations(db, page, page_size, district_id, is_active)


@router.get("/{station_id}", response_model=PoliceStationRead,
            summary="Get police station by ID")
def get_station(station_id: int, db: Session = Depends(get_db)):
    return police_station_service.get_station(db, station_id)


@router.post("", response_model=PoliceStationRead, status_code=201,
             summary="Create police station — admin only")
def create_station(
    payload: PoliceStationCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin")),
):
    return police_station_service.create_station(db, payload)


@router.patch("/{station_id}", response_model=PoliceStationRead,
              summary="Update police station — admin | supervisor")
def update_station(
    station_id: int,
    payload: PoliceStationUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor")),
):
    return police_station_service.update_station(db, station_id, payload)


@router.delete("/{station_id}", status_code=204,
               summary="Delete police station — admin only")
def delete_station(
    station_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin")),
):
    police_station_service.delete_station(db, station_id)
