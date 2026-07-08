from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user, require_role
from schemas.investigation import (
    InvestigationCreate,
    InvestigationUpdate,
    InvestigationRead,
    InvestigationSummary,
    InvestigationNoteCreate,
    InvestigationNoteRead,
    InvestigationOfficerCreate,
)
from schemas.base import PaginatedResponse
from services import investigation_service

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get(
    "",
    response_model=PaginatedResponse[InvestigationSummary],
    summary="List investigations",
)
def list_investigations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    lead_officer_id: Optional[int] = Query(None, description="Filter by lead officer ID"),
    db: Session = Depends(get_db),
):
    return investigation_service.list_investigations(db, page, page_size, lead_officer_id)


@router.get(
    "/{investigation_id}",
    response_model=InvestigationRead,
    summary="Get investigation by ID",
)
def get_investigation(investigation_id: int, db: Session = Depends(get_db)):
    return investigation_service.get_investigation(db, investigation_id)


@router.post(
    "",
    response_model=InvestigationRead,
    status_code=201,
    summary="Create investigation — admin | supervisor",
)
def create_investigation(
    payload: InvestigationCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor")),
):
    return investigation_service.create_investigation(db, payload)


@router.patch(
    "/{investigation_id}",
    response_model=InvestigationRead,
    summary="Update investigation — admin | supervisor | investigator",
)
def update_investigation(
    investigation_id: int,
    payload: InvestigationUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor", "investigator")),
):
    return investigation_service.update_investigation(db, investigation_id, payload)


@router.delete(
    "/{investigation_id}",
    status_code=204,
    summary="Delete investigation — admin | supervisor only",
)
def delete_investigation(
    investigation_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor")),
):
    investigation_service.delete_investigation(db, investigation_id)


# ── Notes ─────────────────────────────────────────────────────────────────────
@router.post(
    "/{investigation_id}/notes",
    response_model=InvestigationNoteRead,
    status_code=201,
    summary="Add note to investigation — all roles",
)
def add_investigation_note(
    investigation_id: int,
    payload: InvestigationNoteCreate,
    db: Session = Depends(get_db),
):
    payload.investigation_id = investigation_id
    return investigation_service.add_investigation_note(db, payload)


@router.get(
    "/{investigation_id}/notes",
    response_model=List[InvestigationNoteRead],
    summary="Get all notes for an investigation",
)
def list_investigation_notes(investigation_id: int, db: Session = Depends(get_db)):
    return investigation_service.list_investigation_notes(db, investigation_id)


# ── Officers Assignment ───────────────────────────────────────────────────────
@router.post(
    "/{investigation_id}/officers",
    status_code=201,
    summary="Assign officer to investigation — admin | supervisor only",
)
def assign_officer(
    investigation_id: int,
    payload: InvestigationOfficerCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor")),
):
    payload.investigation_id = investigation_id
    return investigation_service.assign_officer_to_investigation(db, payload)
