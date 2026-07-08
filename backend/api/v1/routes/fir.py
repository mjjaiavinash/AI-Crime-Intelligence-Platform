from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user, require_role
from schemas.fir import FIRCreate, FIRUpdate, FIRRead, FIRSummary
from schemas.base import PaginatedResponse
from services import fir_service

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get(
    "",
    response_model=PaginatedResponse[FIRSummary],
    summary="List FIRs — all roles",
)
def list_firs(
    page:          int            = Query(1,  ge=1),
    page_size:     int            = Query(20, ge=1, le=100),
    status:        Optional[str]  = Query(None, description="Filter by status"),
    station_id:    Optional[int]  = Query(None, description="Filter by station"),
    crime_type_id: Optional[int]  = Query(None, description="Filter by crime type"),
    db: Session = Depends(get_db),
):
    """
    Returns a paginated list of FIRs.
    Supports filtering by `status`, `station_id`, and `crime_type_id`.
    """
    return fir_service.list_firs(db, page, page_size, status, station_id, crime_type_id)


@router.get(
    "/number/{fir_number}",
    response_model=FIRRead,
    summary="Get FIR by FIR number — all roles",
)
def get_fir_by_number(fir_number: str, db: Session = Depends(get_db)):
    """Fetch a single FIR using its official FIR number (e.g. FIR/DL/2024/001)."""
    return fir_service.get_fir_by_number(db, fir_number)


@router.get(
    "/{fir_id}",
    response_model=FIRRead,
    summary="Get FIR by ID — all roles",
)
def get_fir(fir_id: int, db: Session = Depends(get_db)):
    """Fetch a single FIR with full details including station, crime type and officer info."""
    return fir_service.get_fir(db, fir_id)


@router.post(
    "",
    response_model=FIRRead,
    status_code=201,
    summary="File a new FIR — admin | supervisor | investigator",
)
def create_fir(
    payload:      FIRCreate,
    db:           Session = Depends(get_db),
    current_user: dict    = Depends(require_role("admin", "supervisor", "investigator")),
):
    """
    File a new First Information Report.
    - `fir_number` must be unique.
    - `station_id`, `crime_type_id` must reference existing records.
    - `io_officer_id` is optional but must reference a valid officer if provided.
    """
    return fir_service.create_fir(db, payload)


@router.patch(
    "/{fir_id}",
    response_model=FIRRead,
    summary="Update FIR — admin | supervisor | investigator",
)
def update_fir(
    fir_id:  int,
    payload: FIRUpdate,
    db:      Session = Depends(get_db),
    _:       dict    = Depends(require_role("admin", "supervisor", "investigator")),
):
    """Partially update an existing FIR. Only provided fields are changed."""
    return fir_service.update_fir(db, fir_id, payload)


@router.delete(
    "/{fir_id}",
    status_code=204,
    summary="Delete FIR — admin | supervisor only",
)
def delete_fir(
    fir_id: int,
    db:     Session = Depends(get_db),
    _:      dict    = Depends(require_role("admin", "supervisor")),
):
    """
    Permanently delete a FIR and all its linked victims, suspects and evidence
    (cascade delete).
    """
    fir_service.delete_fir(db, fir_id)
