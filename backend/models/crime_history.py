from typing import Optional
import enum
from datetime import date
from sqlalchemy import String, ForeignKey, Enum, Date, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from models.mixins import TimestampMixin


class HistoryOutcome(str, enum.Enum):
    arrested = "arrested"
    convicted = "convicted"
    acquitted = "acquitted"
    bailed = "bailed"
    absconded = "absconded"
    pending = "pending"


class CrimeHistory(Base, TimestampMixin):
    __tablename__ = "crime_history"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    suspect_id: Mapped[int] = mapped_column(
        ForeignKey("suspects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    crime_type_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("crime_types.id", ondelete="SET NULL"), nullable=True, index=True
    )
    fir_reference: Mapped[Optional[str]] = mapped_column(String(100))
    fir_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("fir.id", ondelete="SET NULL"), nullable=True, index=True
    )
    station_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("police_stations.id", ondelete="SET NULL"), nullable=True, index=True
    )
    incident_date: Mapped[Optional[date]] = mapped_column(Date)
    description: Mapped[Optional[str]] = mapped_column(Text)
    outcome: Mapped[HistoryOutcome] = mapped_column(
        Enum(HistoryOutcome), default=HistoryOutcome.pending, nullable=False
    )
    sentence: Mapped[Optional[str]] = mapped_column(String(255))
    release_date: Mapped[Optional[date]] = mapped_column(Date)

    suspect: Mapped["Suspect"] = relationship("Suspect", foreign_keys=[suspect_id])
    crime_type_rel: Mapped["CrimeType"] = relationship("CrimeType", foreign_keys=[crime_type_id])
    fir: Mapped["FIR"] = relationship("FIR", foreign_keys=[fir_id])
    station: Mapped["PoliceStation"] = relationship("PoliceStation", foreign_keys=[station_id])

    def __repr__(self) -> str:
        return f"<CrimeHistory id={self.id} suspect_id={self.suspect_id} outcome={self.outcome}>"
