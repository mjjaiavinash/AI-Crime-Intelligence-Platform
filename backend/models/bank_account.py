from typing import Optional
import enum
from datetime import date
from sqlalchemy import String, Integer, Numeric, ForeignKey, Enum, Date, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from models.mixins import TimestampMixin


class AccountType(str, enum.Enum):
    savings = "savings"
    current = "current"
    fixed_deposit = "fixed_deposit"
    crypto_wallet = "crypto_wallet"
    other = "other"


class FreezeStatus(str, enum.Enum):
    active = "active"
    frozen = "frozen"
    closed = "closed"
    under_scrutiny = "under_scrutiny"


class BankAccount(Base, TimestampMixin):
    __tablename__ = "bank_accounts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    suspect_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("suspects.id", ondelete="SET NULL"), nullable=True, index=True
    )
    fir_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("fir.id", ondelete="SET NULL"), nullable=True, index=True
    )
    account_number: Mapped[str] = mapped_column(String(30), nullable=False)
    account_holder_name: Mapped[str] = mapped_column(String(200), nullable=False)
    bank_name: Mapped[str] = mapped_column(String(200), nullable=False)
    branch_name: Mapped[Optional[str]] = mapped_column(String(200))
    ifsc_code: Mapped[Optional[str]] = mapped_column(String(20))
    swift_code: Mapped[Optional[str]] = mapped_column(String(20))
    account_type: Mapped[AccountType] = mapped_column(
        Enum(AccountType), default=AccountType.savings, nullable=False
    )
    flagged_amount: Mapped[Optional[float]] = mapped_column(Numeric(18, 2))
    transaction_count: Mapped[Optional[int]] = mapped_column(Integer)
    freeze_status: Mapped[FreezeStatus] = mapped_column(
        Enum(FreezeStatus), default=FreezeStatus.active, nullable=False
    )
    freeze_date: Mapped[Optional[date]] = mapped_column(Date)
    freeze_order_ref: Mapped[Optional[str]] = mapped_column(String(100))
    notes: Mapped[Optional[str]] = mapped_column(Text)

    suspect: Mapped["Suspect"] = relationship("Suspect", foreign_keys=[suspect_id])
    fir: Mapped["FIR"] = relationship("FIR", foreign_keys=[fir_id])

    def __repr__(self) -> str:
        return f"<BankAccount id={self.id} num={self.account_number!r} status={self.freeze_status}>"
