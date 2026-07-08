from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user, require_role
from schemas.crime_history import CrimeHistoryCreate, CrimeHistoryUpdate, CrimeHistoryRead, CrimeHistorySummary
from schemas.base import PaginatedResponse
from services import crime_history_service

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get(
    "",
    response_model=PaginatedResponse[CrimeHistorySummary],
    summary="List prior criminal history records",
)
def list_crime_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    suspect_id: Optional[int] = Query(None, description="Filter by Suspect ID"),
    db: Session = Depends(get_db),
):
    return crime_history_service.list_crime_history(db, page, page_size, suspect_id)


@router.get(
    "/{history_id}",
    response_model=CrimeHistoryRead,
    summary="Get criminal record by ID",
)
def get_crime_history(history_id: int, db: Session = Depends(get_db)):
    return crime_history_service.get_crime_history(db, history_id)


@router.post(
    "",
    response_model=CrimeHistoryRead,
    status_code=201,
    summary="Create prior criminal record — admin | supervisor | investigator",
)
def create_crime_history(
    payload: CrimeHistoryCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor", "investigator")),
):
    return crime_history_service.create_crime_history(db, payload)


@router.patch(
    "/{history_id}",
    response_model=CrimeHistoryRead,
    summary="Update criminal record — admin | supervisor | investigator",
)
def update_crime_history(
    history_id: int,
    payload: CrimeHistoryUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor", "investigator")),
):
    return crime_history_service.update_crime_history(db, history_id, payload)


@router.delete(
    "/{history_id}",
    status_code=204,
    summary="Delete criminal record — admin | supervisor only",
)
def delete_crime_history(
    history_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor")),
):
    crime_history_service.delete_crime_history(db, history_id)
