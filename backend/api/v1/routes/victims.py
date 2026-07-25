from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user, require_role
from schemas.victim import VictimCreate, VictimUpdate, VictimRead, VictimSummary
from schemas.base import PaginatedResponse
from services import victim_service

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get(
    "",
    response_model=PaginatedResponse[VictimSummary],
    summary="List victims — all roles",
)
def list_victims(
    page:      int           = Query(1,  ge=1),
    page_size: int           = Query(20, ge=1, le=1000),
    fir_id:    Optional[int] = Query(None, description="Filter by FIR ID"),
    db: Session = Depends(get_db),
):
    """Returns a paginated list of victims. Filter by `fir_id` to get victims of a specific FIR."""
    return victim_service.list_victims(db, page, page_size, fir_id)


@router.get(
    "/{victim_id}",
    response_model=VictimRead,
    summary="Get victim by ID — all roles",
)
def get_victim(victim_id: int, db: Session = Depends(get_db)):
    """Fetch full details of a single victim."""
    return victim_service.get_victim(db, victim_id)


@router.post(
    "",
    response_model=VictimRead,
    status_code=201,
    summary="Add victim to FIR — admin | supervisor | investigator",
)
def create_victim(
    payload: VictimCreate,
    db:      Session = Depends(get_db),
    _:       dict    = Depends(require_role("admin", "supervisor", "investigator")),
):
    """
    Add a new victim record linked to an existing FIR.
    - `fir_id` must reference a valid FIR.
    - Set `is_anonymous=true` to hide identity in reports.
    """
    return victim_service.create_victim(db, payload)


@router.patch(
    "/{victim_id}",
    response_model=VictimRead,
    summary="Update victim — admin | supervisor | investigator",
)
def update_victim(
    victim_id: int,
    payload:   VictimUpdate,
    db:        Session = Depends(get_db),
    _:         dict    = Depends(require_role("admin", "supervisor", "investigator")),
):
    """Partially update a victim record. Only provided fields are changed."""
    return victim_service.update_victim(db, victim_id, payload)


@router.delete(
    "/{victim_id}",
    status_code=204,
    summary="Delete victim — admin | supervisor only",
)
def delete_victim(
    victim_id: int,
    db:        Session = Depends(get_db),
    _:         dict    = Depends(require_role("admin", "supervisor")),
):
    """Permanently delete a victim record."""
    victim_service.delete_victim(db, victim_id)
