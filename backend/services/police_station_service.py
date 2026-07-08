from typing import Optional
import math
from sqlalchemy.orm import Session, joinedload
from models.police_station import PoliceStation, District
from schemas.police_station import PoliceStationCreate, PoliceStationUpdate
from schemas.base import PaginatedResponse
from core.exceptions import NotFoundException, ConflictException
from core.logging import get_logger

logger = get_logger(__name__)


def _q(db: Session):
    return db.query(PoliceStation).options(joinedload(PoliceStation.district))


def list_stations(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    district_id: Optional[int] = None,
    is_active: Optional[bool] = None,
) -> PaginatedResponse:
    q = db.query(PoliceStation)
    if district_id:
        q = q.filter(PoliceStation.district_id == district_id)
    if is_active is not None:
        q = q.filter(PoliceStation.is_active == is_active)
    total = q.count()
    items = q.order_by(PoliceStation.name).offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedResponse(
        items=items, total=total, page=page,
        page_size=page_size, pages=math.ceil(total / page_size) if total else 0,
    )


def get_station(db: Session, station_id: int) -> PoliceStation:
    ps = _q(db).filter(PoliceStation.id == station_id).first()
    if not ps:
        raise NotFoundException("PoliceStation")
    return ps


def create_station(db: Session, payload: PoliceStationCreate) -> PoliceStation:
    if not db.get(District, payload.district_id):
        raise NotFoundException("District")
    if db.query(PoliceStation).filter(PoliceStation.station_code == payload.station_code).first():
        raise ConflictException("Station code already exists.")
    ps = PoliceStation(**payload.model_dump())
    db.add(ps)
    db.commit()
    db.refresh(ps)
    logger.info("PoliceStation created: id=%d code=%r", ps.id, ps.station_code)
    return _q(db).filter(PoliceStation.id == ps.id).first()


def update_station(db: Session, station_id: int, payload: PoliceStationUpdate) -> PoliceStation:
    ps = get_station(db, station_id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(ps, field, value)
    db.commit()
    db.refresh(ps)
    return _q(db).filter(PoliceStation.id == ps.id).first()


def delete_station(db: Session, station_id: int) -> None:
    ps = get_station(db, station_id)
    db.delete(ps)
    db.commit()
    logger.info("PoliceStation deleted: id=%d", station_id)
