from typing import Optional
import enum
from datetime import datetime
from sqlalchemy import String, Integer, ForeignKey, Enum, DateTime, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from models.mixins import TimestampMixin


class EvidenceType(str, enum.Enum):
    physical = "physical"
    digital = "digital"
    documentary = "documentary"
    forensic = "forensic"
    witness_statement = "witness_statement"
    cctv_footage = "cctv_footage"
    audio = "audio"
    photograph = "photograph"
    other = "other"


class EvidenceStatus(str, enum.Enum):
    collected = "collected"
    submitted_to_lab = "submitted_to_lab"
    lab_report_received = "lab_report_received"
    presented_in_court = "presented_in_court"
    disposed = "disposed"


class Evidence(Base, TimestampMixin):
    __tablename__ = "evidence"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    fir_id: Mapped[int] = mapped_column(
        ForeignKey("fir.id", ondelete="CASCADE"), nullable=False, index=True
    )
    collected_by: Mapped[Optional[int]] = mapped_column(
        ForeignKey("officers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    evidence_type: Mapped[EvidenceType] = mapped_column(
        Enum(EvidenceType), default=EvidenceType.physical, nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    file_path: Mapped[Optional[str]] = mapped_column(String(500))
    file_name: Mapped[Optional[str]] = mapped_column(String(255))
    file_type: Mapped[Optional[str]] = mapped_column(String(50))
    file_size_kb: Mapped[Optional[int]] = mapped_column(Integer)
    checksum_sha256: Mapped[Optional[str]] = mapped_column(String(64))
    collection_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    collection_location: Mapped[Optional[str]] = mapped_column(String(255))
    lab_reference: Mapped[Optional[str]] = mapped_column(String(100))
    lab_report_path: Mapped[Optional[str]] = mapped_column(String(500))
    status: Mapped[EvidenceStatus] = mapped_column(
        Enum(EvidenceStatus), default=EvidenceStatus.collected, nullable=False
    )
    is_tamper_evident: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    fir: Mapped["FIR"] = relationship("FIR", foreign_keys=[fir_id])
    officer: Mapped["Officer"] = relationship("Officer", foreign_keys=[collected_by])

    def __repr__(self) -> str:
        return f"<Evidence id={self.id} fir_id={self.fir_id} type={self.evidence_type}>"
