from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user, require_role
from schemas.suspect import SuspectCreate, SuspectUpdate, SuspectRead, SuspectSummary
from schemas.base import PaginatedResponse
from services import suspect_service

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get(
    "",
    response_model=PaginatedResponse[SuspectSummary],
    summary="List suspects — all roles",
)
def list_suspects(
    page:          int            = Query(1,  ge=1),
    page_size:     int            = Query(20, ge=1, le=100),
    fir_id:        Optional[int]  = Query(None, description="Filter by FIR ID"),
    arrest_status: Optional[str]  = Query(None, description="at_large | arrested | bailed | absconding | deceased"),
    threat_level:  Optional[str]  = Query(None, description="low | medium | high | extreme"),
    db: Session = Depends(get_db),
):
    """
    Returns a paginated list of suspects.
    Supports filtering by `fir_id`, `arrest_status`, and `threat_level`.
    """
    return suspect_service.list_suspects(db, page, page_size, fir_id, arrest_status, threat_level)


@router.get(
    "/{suspect_id}",
    response_model=SuspectRead,
    summary="Get suspect by ID — all roles",
)
def get_suspect(suspect_id: int, db: Session = Depends(get_db)):
    """Fetch full profile of a single suspect including physical description and criminal history."""
    return suspect_service.get_suspect(db, suspect_id)


@router.post(
    "",
    response_model=SuspectRead,
    status_code=201,
    summary="Add suspect to FIR — admin | supervisor | investigator",
)
def create_suspect(
    payload: SuspectCreate,
    db:      Session = Depends(get_db),
    _:       dict    = Depends(require_role("admin", "supervisor", "investigator")),
):
    """
    Add a new suspect linked to an existing FIR.
    - `fir_id` must reference a valid FIR.
    - `full_name` can be NULL for unknown suspects.
    - `threat_level` defaults to `low`.
    - `arrest_status` defaults to `at_large`.
    """
    return suspect_service.create_suspect(db, payload)


@router.patch(
    "/{suspect_id}",
    response_model=SuspectRead,
    summary="Update suspect — admin | supervisor | investigator",
)
def update_suspect(
    suspect_id: int,
    payload:    SuspectUpdate,
    db:         Session = Depends(get_db),
    _:          dict    = Depends(require_role("admin", "supervisor", "investigator")),
):
    """
    Partially update a suspect record.
    Use this to update `arrest_status` when a suspect is arrested or bailed.
    """
    return suspect_service.update_suspect(db, suspect_id, payload)


@router.delete(
    "/{suspect_id}",
    status_code=204,
    summary="Delete suspect — admin | supervisor only",
)
def delete_suspect(
    suspect_id: int,
    db:         Session = Depends(get_db),
    _:          dict    = Depends(require_role("admin", "supervisor")),
):
    """Permanently delete a suspect record."""
    suspect_service.delete_suspect(db, suspect_id)
