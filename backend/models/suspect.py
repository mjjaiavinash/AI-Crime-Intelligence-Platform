from typing import Optional
import enum
from datetime import datetime
from sqlalchemy import String, Text, Enum, ForeignKey, Boolean, DateTime, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from models.mixins import TimestampMixin


class ThreatLevel(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    extreme = "extreme"


class ArrestStatus(str, enum.Enum):
    at_large = "at_large"
    arrested = "arrested"
    bailed = "bailed"
    absconding = "absconding"
    deceased = "deceased"


class SuspectFIR(Base):
    __tablename__ = "suspect_fir"

    suspect_id: Mapped[int] = mapped_column(
        ForeignKey("suspects.id", ondelete="CASCADE"), primary_key=True
    )
    fir_id: Mapped[int] = mapped_column(
        ForeignKey("fir.id", ondelete="CASCADE"), primary_key=True
    )
    role_in_case: Mapped[Optional[str]] = mapped_column(String(100))
    added_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    suspect: Mapped["Suspect"] = relationship("Suspect", back_populates="fir_links")
    fir: Mapped["FIR"] = relationship("FIR", back_populates="suspect_links")


class Suspect(Base, TimestampMixin):
    __tablename__ = "suspects"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    full_name: Mapped[Optional[str]] = mapped_column(String(200))
    alias: Mapped[Optional[str]] = mapped_column(String(200))
    gender: Mapped[str] = mapped_column(String(10), nullable=False, default="unknown")
    age_estimated: Mapped[Optional[int]] = mapped_column(SmallInteger)
    nationality: Mapped[Optional[str]] = mapped_column(String(100), default="Indian")
    id_type: Mapped[Optional[str]] = mapped_column(String(50))
    id_number: Mapped[Optional[str]] = mapped_column(String(100))
    height_cm: Mapped[Optional[int]] = mapped_column(SmallInteger)
    weight_kg: Mapped[Optional[int]] = mapped_column(SmallInteger)
    complexion: Mapped[Optional[str]] = mapped_column(String(50))
    build: Mapped[Optional[str]] = mapped_column(String(50))
    distinguishing_marks: Mapped[Optional[str]] = mapped_column(Text)
    photo_path: Mapped[Optional[str]] = mapped_column(String(500))
    phone: Mapped[Optional[str]] = mapped_column(String(20))
    address: Mapped[Optional[str]] = mapped_column(Text)
    district_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("districts.id", ondelete="SET NULL"), nullable=True, index=True
    )
    is_known_criminal: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    gang_affiliation: Mapped[Optional[str]] = mapped_column(String(200))
    threat_level: Mapped[ThreatLevel] = mapped_column(
        Enum(ThreatLevel), default=ThreatLevel.low, nullable=False
    )
    arrest_status: Mapped[ArrestStatus] = mapped_column(
        Enum(ArrestStatus), default=ArrestStatus.at_large, nullable=False
    )
    arrested_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    arrested_by: Mapped[Optional[int]] = mapped_column(
        ForeignKey("officers.id", ondelete="SET NULL"), nullable=True, index=True
    )

    fir_links: Mapped[list["SuspectFIR"]] = relationship(
        "SuspectFIR", back_populates="suspect", cascade="all, delete-orphan"
    )
    firs: Mapped[list["FIR"]] = relationship(
        "FIR", secondary="suspect_fir", back_populates="suspects", viewonly=True
    )
    arrested_by_officer: Mapped["Officer"] = relationship("Officer", foreign_keys=[arrested_by])

    def __repr__(self) -> str:
        return f"<Suspect id={self.id} name={self.full_name!r} status={self.arrest_status}>"
