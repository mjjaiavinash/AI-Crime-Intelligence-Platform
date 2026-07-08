from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user, require_role
from schemas.crime_type import CrimeTypeCreate, CrimeTypeUpdate, CrimeTypeRead
from schemas.base import PaginatedResponse
from services import crime_type_service

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get("", response_model=PaginatedResponse[CrimeTypeRead],
            summary="List all crime types")
def list_crime_types(
    page:     int            = Query(1,  ge=1),
    page_size:int            = Query(20, ge=1, le=100),
    category: Optional[str] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db),
):
    return crime_type_service.list_crime_types(db, page, page_size, category)


@router.get("/{crime_type_id}", response_model=CrimeTypeRead,
            summary="Get crime type by ID")
def get_crime_type(crime_type_id: int, db: Session = Depends(get_db)):
    return crime_type_service.get_crime_type(db, crime_type_id)


@router.post("", response_model=CrimeTypeRead, status_code=201,
             summary="Create crime type — admin | supervisor")
def create_crime_type(
    payload: CrimeTypeCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor")),
):
    return crime_type_service.create_crime_type(db, payload)


@router.patch("/{crime_type_id}", response_model=CrimeTypeRead,
              summary="Update crime type — admin | supervisor")
def update_crime_type(
    crime_type_id: int,
    payload: CrimeTypeUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor")),
):
    return crime_type_service.update_crime_type(db, crime_type_id, payload)


@router.delete("/{crime_type_id}", status_code=204,
               summary="Delete crime type — admin only")
def delete_crime_type(
    crime_type_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin")),
):
    crime_type_service.delete_crime_type(db, crime_type_id)
