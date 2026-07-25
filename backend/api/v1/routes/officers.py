from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user, require_role
from schemas.officer import OfficerCreate, OfficerUpdate, OfficerRead, OfficerSummary
from schemas.base import PaginatedResponse
from services import officer_service

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("", response_model=PaginatedResponse[OfficerSummary],
            summary="List all officers")
def list_officers(
    page:       int            = Query(1,  ge=1),
    page_size:  int            = Query(20, ge=1, le=500),
    station_id: Optional[int]  = Query(None, description="Filter by station"),
    is_active:  Optional[bool] = Query(None, description="Filter by active status"),
    db: Session = Depends(get_db),
):
    return officer_service.list_officers(db, page, page_size, station_id, is_active)


@router.get("/{officer_id}", response_model=OfficerRead,
            summary="Get officer by ID")
def get_officer(officer_id: int, db: Session = Depends(get_db)):
    return officer_service.get_officer(db, officer_id)


@router.post("", response_model=OfficerRead, status_code=201,
             summary="Create officer profile — admin | supervisor")
def create_officer(
    payload: OfficerCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor")),
):
    return officer_service.create_officer(db, payload)


@router.patch("/{officer_id}", response_model=OfficerRead,
              summary="Update officer — admin | supervisor")
def update_officer(
    officer_id: int,
    payload: OfficerUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor")),
):
    return officer_service.update_officer(db, officer_id, payload)


@router.delete("/{officer_id}", status_code=204,
               summary="Delete officer — admin only")
def delete_officer(
    officer_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin")),
):
    officer_service.delete_officer(db, officer_id)
