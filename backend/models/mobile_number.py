from typing import Optional
import enum
from sqlalchemy import String, ForeignKey, Enum, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from models.mixins import TimestampMixin


class SIMType(str, enum.Enum):
    prepaid = "prepaid"
    postpaid = "postpaid"
    unknown = "unknown"


class MobileNumber(Base, TimestampMixin):
    __tablename__ = "mobile_numbers"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    suspect_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("suspects.id", ondelete="SET NULL"), nullable=True, index=True
    )
    fir_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("fir.id", ondelete="SET NULL"), nullable=True, index=True
    )
    mobile_number: Mapped[str] = mapped_column(String(20), nullable=False)
    country_code: Mapped[str] = mapped_column(String(10), default="+91", nullable=False)
    operator: Mapped[Optional[str]] = mapped_column(String(100))
    sim_type: Mapped[SIMType] = mapped_column(
        Enum(SIMType), default=SIMType.unknown, nullable=False
    )
    imei_number: Mapped[Optional[str]] = mapped_column(String(20))
    imsi_number: Mapped[Optional[str]] = mapped_column(String(20))
    registered_name: Mapped[Optional[str]] = mapped_column(String(200))
    registered_address: Mapped[Optional[str]] = mapped_column(Text)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    last_location: Mapped[Optional[str]] = mapped_column(String(255))
    surveillance_flag: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    suspect: Mapped["Suspect"] = relationship("Suspect", foreign_keys=[suspect_id])
    fir: Mapped["FIR"] = relationship("FIR", foreign_keys=[fir_id])

    def __repr__(self) -> str:
        return f"<MobileNumber id={self.id} num={self.mobile_number!r} operator={self.operator}>"
