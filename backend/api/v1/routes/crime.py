from typing import Optional
"""
api/v1/routes/crime.py
──────────────────────
Role matrix:
  GET  (list / detail) — all authenticated roles
  POST (create)        — admin | supervisor | investigator
  PATCH (update)       — admin | supervisor | investigator
  DELETE               — admin | supervisor only
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import get_current_user, require_role
from schemas.crime import CrimeCreate, CrimeUpdate, CrimeRead, CrimeSummary
from schemas.base import PaginatedResponse
from services import crime_service

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("", response_model=PaginatedResponse[CrimeSummary],
            summary="List crimes — all roles")
def list_crimes(
    page:       int = Query(1, ge=1),
    page_size:  int = Query(20, ge=1, le=100),
    crime_type: Optional[str] = None,
    status:     Optional[str] = None,
    db: Session = Depends(get_db),
):
    return crime_service.list_crimes(db, page, page_size, crime_type, status)


@router.get("/{crime_id}", response_model=CrimeRead,
            summary="Get crime detail — all roles")
def get_crime(crime_id: int, db: Session = Depends(get_db)):
    return crime_service.get_crime(db, crime_id)


@router.post("", response_model=CrimeRead, status_code=201,
             summary="Create crime — admin | supervisor | investigator")
def create_crime(
    payload:      CrimeCreate,
    db:           Session = Depends(get_db),
    current_user: dict    = Depends(require_role("admin", "supervisor", "investigator")),
):
    return crime_service.create_crime(db, payload, int(current_user["sub"]))


@router.patch("/{crime_id}", response_model=CrimeRead,
              summary="Update crime — admin | supervisor | investigator")
def update_crime(
    crime_id: int,
    payload:  CrimeUpdate,
    db:       Session = Depends(get_db),
    _:        dict    = Depends(require_role("admin", "supervisor", "investigator")),
):
    return crime_service.update_crime(db, crime_id, payload)


@router.delete("/{crime_id}", status_code=204,
               summary="Delete crime — admin | supervisor only")
def delete_crime(
    crime_id: int,
    db:       Session = Depends(get_db),
    _:        dict    = Depends(require_role("admin", "supervisor")),
):
    crime_service.delete_crime(db, crime_id)
