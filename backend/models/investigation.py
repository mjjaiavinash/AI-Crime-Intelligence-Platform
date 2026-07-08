from typing import Optional
import enum
from datetime import date, datetime
from sqlalchemy import String, Integer, ForeignKey, Enum, Date, DateTime, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from models.mixins import TimestampMixin


class InvestigationStatus(str, enum.Enum):
    initiated = "initiated"
    active = "active"
    pending_arrest = "pending_arrest"
    pending_lab = "pending_lab"
    pending_court = "pending_court"
    charge_sheet_ready = "charge_sheet_ready"
    closed = "closed"


class InvestigationOutcome(str, enum.Enum):
    pending = "pending"
    charge_sheet_filed = "charge_sheet_filed"
    final_report_true = "final_report_true"
    final_report_false = "final_report_false"
    referred = "referred"


class NoteType(str, enum.Enum):
    general = "general"
    lead = "lead"
    witness_interview = "witness_interview"
    site_visit = "site_visit"
    lab_update = "lab_update"
    court_update = "court_update"
    arrest_update = "arrest_update"


class InvestigationOfficer(Base):
    __tablename__ = "investigation_officers"

    investigation_id: Mapped[int] = mapped_column(
        ForeignKey("investigation.id", ondelete="CASCADE"), primary_key=True
    )
    officer_id: Mapped[int] = mapped_column(
        ForeignKey("officers.id", ondelete="CASCADE"), primary_key=True
    )
    role: Mapped[Optional[str]] = mapped_column(String(100))
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )
    relieved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))


class Investigation(Base, TimestampMixin):
    __tablename__ = "investigation"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    fir_id: Mapped[int] = mapped_column(
        ForeignKey("fir.id", ondelete="CASCADE"), unique=True, nullable=False, index=True
    )
    lead_officer_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("officers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    target_close_date: Mapped[Optional[date]] = mapped_column(Date)
    actual_close_date: Mapped[Optional[date]] = mapped_column(Date)
    status: Mapped[InvestigationStatus] = mapped_column(
        Enum(InvestigationStatus), default=InvestigationStatus.initiated, nullable=False
    )
    outcome: Mapped[InvestigationOutcome] = mapped_column(
        Enum(InvestigationOutcome), default=InvestigationOutcome.pending, nullable=False
    )
    outcome_summary: Mapped[Optional[str]] = mapped_column(Text)
    supervisor_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("officers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))

    fir: Mapped["FIR"] = relationship("FIR", foreign_keys=[fir_id])
    lead_officer: Mapped["Officer"] = relationship("Officer", foreign_keys=[lead_officer_id])
    supervisor: Mapped["Officer"] = relationship("Officer", foreign_keys=[supervisor_id])
    notes: Mapped[list["InvestigationNote"]] = relationship(
        "InvestigationNote", back_populates="investigation", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Investigation id={self.id} fir_id={self.fir_id} status={self.status}>"


class InvestigationNote(Base):
    __tablename__ = "investigation_notes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    investigation_id: Mapped[int] = mapped_column(
        ForeignKey("investigation.id", ondelete="CASCADE"), nullable=False, index=True
    )
    officer_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("officers.id", ondelete="SET NULL"), nullable=True, index=True
    )
    note: Mapped[str] = mapped_column(Text, nullable=False)
    note_type: Mapped[NoteType] = mapped_column(
        Enum(NoteType), default=NoteType.general, nullable=False
    )
    is_confidential: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow, nullable=False
    )

    investigation: Mapped["Investigation"] = relationship("Investigation", back_populates="notes")
    officer: Mapped["Officer"] = relationship("Officer", foreign_keys=[officer_id])

    def __repr__(self) -> str:
        return f"<InvestigationNote id={self.id} inv_id={self.investigation_id} type={self.note_type}>"
