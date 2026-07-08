from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user, require_role
from schemas.mobile_number import MobileNumberCreate, MobileNumberUpdate, MobileNumberRead, MobileNumberSummary
from schemas.base import PaginatedResponse
from services import mobile_number_service

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get(
    "",
    response_model=PaginatedResponse[MobileNumberSummary],
    summary="List mobile numbers",
)
def list_mobile_numbers(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    fir_id: Optional[int] = Query(None, description="Filter by FIR ID"),
    suspect_id: Optional[int] = Query(None, description="Filter by Suspect ID"),
    db: Session = Depends(get_db),
):
    return mobile_number_service.list_mobile_numbers(db, page, page_size, fir_id, suspect_id)


@router.get(
    "/{number_id}",
    response_model=MobileNumberRead,
    summary="Get mobile number by ID",
)
def get_mobile_number(number_id: int, db: Session = Depends(get_db)):
    return mobile_number_service.get_mobile_number(db, number_id)


@router.post(
    "",
    response_model=MobileNumberRead,
    status_code=201,
    summary="Add mobile number — admin | supervisor | investigator",
)
def create_mobile_number(
    payload: MobileNumberCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor", "investigator")),
):
    return mobile_number_service.create_mobile_number(db, payload)


@router.patch(
    "/{number_id}",
    response_model=MobileNumberRead,
    summary="Update mobile number — admin | supervisor | investigator",
)
def update_mobile_number(
    number_id: int,
    payload: MobileNumberUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor", "investigator")),
):
    return mobile_number_service.update_mobile_number(db, number_id, payload)


@router.delete(
    "/{number_id}",
    status_code=204,
    summary="Delete mobile number — admin | supervisor only",
)
def delete_mobile_number(
    number_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor")),
):
    mobile_number_service.delete_mobile_number(db, number_id)
