from typing import Optional
import math
from sqlalchemy.orm import Session, joinedload
from models.officer import Officer
from models.police_station import PoliceStation
from models.user import User
from schemas.officer import OfficerCreate, OfficerUpdate
from schemas.base import PaginatedResponse
from core.exceptions import NotFoundException, ConflictException
from core.logging import get_logger

logger = get_logger(__name__)


def _q(db: Session):
    return db.query(Officer).options(
        joinedload(Officer.user),
        joinedload(Officer.station),
    )


def list_officers(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    station_id: Optional[int] = None,
    is_active: Optional[bool] = None,
) -> PaginatedResponse:
    q = db.query(Officer)
    if station_id:
        q = q.filter(Officer.station_id == station_id)
    if is_active is not None:
        q = q.filter(Officer.is_active == is_active)
    total = q.count()
    items = q.order_by(Officer.rank).offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedResponse(
        items=items, total=total, page=page,
        page_size=page_size, pages=math.ceil(total / page_size) if total else 0,
    )


def get_officer(db: Session, officer_id: int) -> Officer:
    o = _q(db).filter(Officer.id == officer_id).first()
    if not o:
        raise NotFoundException("Officer")
    return o


def create_officer(db: Session, payload: OfficerCreate) -> Officer:
    if not db.get(User, payload.user_id):
        raise NotFoundException("User")
    if not db.get(PoliceStation, payload.station_id):
        raise NotFoundException("PoliceStation")
    if db.query(Officer).filter(Officer.user_id == payload.user_id).first():
        raise ConflictException("User already has an officer profile.")
    if db.query(Officer).filter(Officer.badge_number == payload.badge_number).first():
        raise ConflictException("Badge number already exists.")
    o = Officer(**payload.model_dump())
    db.add(o)
    db.commit()
    db.refresh(o)
    logger.info("Officer created: id=%d badge=%r", o.id, o.badge_number)
    return _q(db).filter(Officer.id == o.id).first()


def update_officer(db: Session, officer_id: int, payload: OfficerUpdate) -> Officer:
    o = get_officer(db, officer_id)
    if payload.station_id and not db.get(PoliceStation, payload.station_id):
        raise NotFoundException("PoliceStation")
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(o, field, value)
    db.commit()
    db.refresh(o)
    return _q(db).filter(Officer.id == o.id).first()


def delete_officer(db: Session, officer_id: int) -> None:
    o = get_officer(db, officer_id)
    db.delete(o)
    db.commit()
    logger.info("Officer deleted: id=%d", officer_id)
