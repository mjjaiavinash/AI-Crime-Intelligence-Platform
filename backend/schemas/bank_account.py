from datetime import date, datetime
from typing import Optional
from decimal import Decimal
from models.bank_account import AccountType, FreezeStatus
from schemas.base import APIBase


class BankAccountBase(APIBase):
    suspect_id: Optional[int] = None
    fir_id: Optional[int] = None
    account_number: str
    account_holder_name: str
    bank_name: str
    branch_name: Optional[str] = None
    ifsc_code: Optional[str] = None
    swift_code: Optional[str] = None
    account_type: AccountType = AccountType.savings
    flagged_amount: Optional[Decimal] = None
    transaction_count: Optional[int] = None
    freeze_status: FreezeStatus = FreezeStatus.active
    freeze_date: Optional[date] = None
    freeze_order_ref: Optional[str] = None
    notes: Optional[str] = None


class BankAccountCreate(BankAccountBase):
    pass


class BankAccountUpdate(APIBase):
    suspect_id: Optional[int] = None
    fir_id: Optional[int] = None
    account_number: Optional[str] = None
    account_holder_name: Optional[str] = None
    bank_name: Optional[str] = None
    branch_name: Optional[str] = None
    ifsc_code: Optional[str] = None
    swift_code: Optional[str] = None
    account_type: Optional[AccountType] = None
    flagged_amount: Optional[Decimal] = None
    transaction_count: Optional[int] = None
    freeze_status: Optional[FreezeStatus] = None
    freeze_date: Optional[date] = None
    freeze_order_ref: Optional[str] = None
    notes: Optional[str] = None


class BankAccountRead(BankAccountBase):
    id: int
    created_at: datetime
    updated_at: datetime


class BankAccountSummary(APIBase):
    id: int
    suspect_id: Optional[int] = None
    fir_id: Optional[int] = None
    account_number: str
    account_holder_name: str
    bank_name: str
    account_type: AccountType
    freeze_status: FreezeStatus
    flagged_amount: Optional[Decimal] = None
    transaction_count: Optional[int] = None
    notes: Optional[str] = None
