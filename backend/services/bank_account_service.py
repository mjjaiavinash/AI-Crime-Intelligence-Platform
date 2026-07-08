from typing import Optional
import math
from sqlalchemy.orm import Session
from models.bank_account import BankAccount
from schemas.bank_account import BankAccountCreate, BankAccountUpdate
from schemas.base import PaginatedResponse
from core.exceptions import NotFoundException
from core.logging import get_logger

logger = get_logger(__name__)


def list_bank_accounts(
    db: Session,
    page: int = 1,
    page_size: int = 20,
    fir_id: Optional[int] = None,
    suspect_id: Optional[int] = None,
) -> PaginatedResponse:
    q = db.query(BankAccount)
    if fir_id:
        q = q.filter(BankAccount.fir_id == fir_id)
    if suspect_id:
        q = q.filter(BankAccount.suspect_id == suspect_id)
    total = q.count()
    items = q.order_by(BankAccount.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    return PaginatedResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        pages=math.ceil(total / page_size) if total else 0,
    )


def get_bank_account(db: Session, account_id: int) -> BankAccount:
    ba = db.get(BankAccount, account_id)
    if not ba:
        raise NotFoundException("BankAccount")
    return ba


def create_bank_account(db: Session, payload: BankAccountCreate) -> BankAccount:
    ba = BankAccount(**payload.model_dump())
    db.add(ba)
    db.commit()
    db.refresh(ba)
    logger.info("BankAccount created: id=%d num=%s", ba.id, ba.account_number)
    return ba


def update_bank_account(db: Session, account_id: int, payload: BankAccountUpdate) -> BankAccount:
    ba = get_bank_account(db, account_id)
    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(ba, field, value)
    db.commit()
    db.refresh(ba)
    return ba


def delete_bank_account(db: Session, account_id: int) -> None:
    ba = get_bank_account(db, account_id)
    db.delete(ba)
    db.commit()
    logger.info("BankAccount deleted: id=%d", account_id)
