from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user, require_role
from schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleRead, VehicleSummary
from schemas.base import PaginatedResponse
from services import vehicle_service

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get(
    "",
    response_model=PaginatedResponse[VehicleSummary],
    summary="List vehicles",
)
def list_vehicles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    fir_id: Optional[int] = Query(None, description="Filter by FIR ID"),
    suspect_id: Optional[int] = Query(None, description="Filter by Suspect ID"),
    db: Session = Depends(get_db),
):
    return vehicle_service.list_vehicles(db, page, page_size, fir_id, suspect_id)


@router.get(
    "/{vehicle_id}",
    response_model=VehicleRead,
    summary="Get vehicle by ID",
)
def get_vehicle(vehicle_id: int, db: Session = Depends(get_db)):
    return vehicle_service.get_vehicle(db, vehicle_id)


@router.post(
    "",
    response_model=VehicleRead,
    status_code=201,
    summary="Add vehicle — admin | supervisor | investigator",
)
def create_vehicle(
    payload: VehicleCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor", "investigator")),
):
    return vehicle_service.create_vehicle(db, payload)


@router.patch(
    "/{vehicle_id}",
    response_model=VehicleRead,
    summary="Update vehicle — admin | supervisor | investigator",
)
def update_vehicle(
    vehicle_id: int,
    payload: VehicleUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor", "investigator")),
):
    return vehicle_service.update_vehicle(db, vehicle_id, payload)


@router.delete(
    "/{vehicle_id}",
    status_code=204,
    summary="Delete vehicle — admin | supervisor only",
)
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor")),
):
    vehicle_service.delete_vehicle(db, vehicle_id)
