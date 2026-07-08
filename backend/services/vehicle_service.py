from typing import Optional
import math
from sqlalchemy.orm import Session
from models.vehicle import Vehicle
from schemas.vehicle import VehicleCreate, VehicleUpdate
from schemas.base import PaginatedResponse
from core.exceptions import NotFoundException
from core.logging import get_logger

logger = get_logger(__name__)


def list_vehicles(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    fir_id: Optional[int] = None,
    suspect_id: Optional[int] = None,
) -> PaginatedResponse:
    q = db.query(Vehicle)
    if fir_id:
        q = q.filter(Vehicle.fir_id == fir_id)
    if suspect_id:
        q = q.filter(Vehicle.suspect_id == suspect_id)
    total = q.count()
    items = q.order_by(Vehicle.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total else 0,
    )


def get_vehicle(db: Session, vehicle_id: int) -> Vehicle:
    v = db.get(Vehicle, vehicle_id)
    if not v:
        raise NotFoundException("Vehicle")
    return v


def create_vehicle(db: Session, payload: VehicleCreate) -> Vehicle:
    v = Vehicle(**payload.model_dump())
    db.add(v)
    db.commit()
    db.refresh(v)
    logger.info("Vehicle created: id=%d reg=%s", v.id, v.registration_number)
    return v


def update_vehicle(db: Session, vehicle_id: int, payload: VehicleUpdate) -> Vehicle:
    v = get_vehicle(db, vehicle_id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(v, field, value)
    db.commit()
    db.refresh(v)
    return v


def delete_vehicle(db: Session, vehicle_id: int) -> None:
    v = get_vehicle(db, vehicle_id)
    db.delete(v)
    db.commit()
    logger.info("Vehicle deleted: id=%d", vehicle_id)
