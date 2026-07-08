from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user, require_role
from schemas.bank_account import BankAccountCreate, BankAccountUpdate, BankAccountRead, BankAccountSummary
from schemas.base import PaginatedResponse
from services import bank_account_service

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get(
    "",
    response_model=PaginatedResponse[BankAccountSummary],
    summary="List bank accounts",
)
def list_bank_accounts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    fir_id: Optional[int] = Query(None, description="Filter by FIR ID"),
    suspect_id: Optional[int] = Query(None, description="Filter by Suspect ID"),
    db: Session = Depends(get_db),
):
    return bank_account_service.list_bank_accounts(db, page, page_size, fir_id, suspect_id)


@router.get(
    "/{account_id}",
    response_model=BankAccountRead,
    summary="Get bank account by ID",
)
def get_bank_account(account_id: int, db: Session = Depends(get_db)):
    return bank_account_service.get_bank_account(db, account_id)


@router.post(
    "",
    response_model=BankAccountRead,
    status_code=201,
    summary="Add bank account — admin | supervisor | investigator",
)
def create_bank_account(
    payload: BankAccountCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor", "investigator")),
):
    return bank_account_service.create_bank_account(db, payload)


@router.patch(
    "/{account_id}",
    response_model=BankAccountRead,
    summary="Update bank account — admin | supervisor | investigator",
)
def update_bank_account(
    account_id: int,
    payload: BankAccountUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor", "investigator")),
):
    return bank_account_service.update_bank_account(db, account_id, payload)


@router.delete(
    "/{account_id}",
    status_code=204,
    summary="Delete bank account — admin | supervisor only",
)
def delete_bank_account(
    account_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor")),
):
    bank_account_service.delete_bank_account(db, account_id)
