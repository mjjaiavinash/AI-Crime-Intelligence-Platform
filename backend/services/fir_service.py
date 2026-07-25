from typing import Optional
import math
from sqlalchemy.orm import Session, joinedload
from models.fir import FIR
from models.police_station import PoliceStation
from models.crime_type import CrimeType
from models.officer import Officer
from schemas.fir import FIRCreate, FIRUpdate
from schemas.base import PaginatedResponse
from core.exceptions import NotFoundException, ConflictException
from core.logging import get_logger
from ai.rag.sync import sync_fir, delete_fir as rag_delete_fir

logger = get_logger(__name__)


def _q(db: Session):
    return db.query(FIR).options(
        joinedload(FIR.station),
        joinedload(FIR.crime_type_rel),
        joinedload(FIR.io_officer),
        joinedload(FIR.filed_by),
    )


def list_firs(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    status: Optional[str] = None,
    station_id: Optional[int] = None,
    crime_type_id: Optional[int] = None,
) -> PaginatedResponse:
    q = _q(db)
    if status:
        q = q.filter(FIR.status == status)
    if station_id:
        q = q.filter(FIR.station_id == station_id)
    if crime_type_id:
        q = q.filter(FIR.crime_type_id == crime_type_id)
    total = q.count()
    items = q.order_by(FIR.reported_date.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedResponse(
        items=items, total=total, page=page,
        page_size=page_size, pages=math.ceil(total / page_size) if total else 0,
    )


def get_fir(db: Session, fir_id: int) -> FIR:
    fir = _q(db).filter(FIR.id == fir_id).first()
    if not fir:
        raise NotFoundException("FIR")
    return fir


def get_fir_by_number(db: Session, fir_number: str) -> FIR:
    fir = _q(db).filter(FIR.fir_number == fir_number).first()
    if not fir:
        raise NotFoundException("FIR")
    return fir


def create_fir(db: Session, payload: FIRCreate) -> FIR:
    if db.query(FIR).filter(FIR.fir_number == payload.fir_number).first():
        raise ConflictException("FIR number already exists.")
    if not db.get(PoliceStation, payload.station_id):
        raise NotFoundException("PoliceStation")
    if not db.get(CrimeType, payload.crime_type_id):
        raise NotFoundException("CrimeType")
    if payload.io_officer_id and not db.get(Officer, payload.io_officer_id):
        raise NotFoundException("IO Officer")
    fir = FIR(**payload.model_dump())
    db.add(fir)
    db.commit()
    db.refresh(fir)
    logger.info("FIR created: id=%d number=%r", fir.id, fir.fir_number)
    result = _q(db).filter(FIR.id == fir.id).first()
    sync_fir(result)
    return result


def update_fir(db: Session, fir_id: int, payload: FIRUpdate) -> FIR:
    fir = get_fir(db, fir_id)
    data = payload.model_dump(exclude_none=True)
    if "crime_type_id" in data and not db.get(CrimeType, data["crime_type_id"]):
        raise NotFoundException("CrimeType")
    if "io_officer_id" in data and not db.get(Officer, data["io_officer_id"]):
        raise NotFoundException("IO Officer")
    for field, value in data.items():
        setattr(fir, field, value)
    db.commit()
    db.refresh(fir)
    result = _q(db).filter(FIR.id == fir.id).first()
    sync_fir(result)
    return result


def delete_fir(db: Session, fir_id: int) -> None:
    fir = get_fir(db, fir_id)
    db.delete(fir)
    db.commit()
    rag_delete_fir(fir_id)
    logger.info("FIR deleted: id=%d", fir_id)
