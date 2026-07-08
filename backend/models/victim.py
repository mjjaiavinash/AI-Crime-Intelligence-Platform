from typing import Optional
import enum
from sqlalchemy import String, Text, Enum, ForeignKey, Boolean, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from models.mixins import TimestampMixin
from datetime import date


class InjuryType(str, enum.Enum):
    none     = "none"
    minor    = "minor"
    grievous = "grievous"
    fatal    = "fatal"


class Victim(Base, TimestampMixin):
    __tablename__ = "victims"

    id:              Mapped[int]          = mapped_column(primary_key=True, index=True)
    fir_id:          Mapped[int]          = mapped_column(ForeignKey("fir.id", ondelete="CASCADE"), nullable=False, index=True)
    full_name:       Mapped[str]          = mapped_column(String(200), nullable=False)
    alias:           Mapped[Optional[str]]     = mapped_column(String(200))
    gender:          Mapped[str]          = mapped_column(String(10),  nullable=False, default="unknown")
    date_of_birth:   Mapped[Optional[date]]    = mapped_column(Date)
    age_at_incident: Mapped[Optional[int]]     = mapped_column()
    nationality:     Mapped[Optional[str]]     = mapped_column(String(100), default="Indian")
    id_type:         Mapped[Optional[str]]     = mapped_column(String(50))
    id_number:       Mapped[Optional[str]]     = mapped_column(String(100))
    phone:           Mapped[Optional[str]]     = mapped_column(String(20))
    email:           Mapped[Optional[str]]     = mapped_column(String(255))
    address:         Mapped[Optional[str]]     = mapped_column(Text)
    injury_type:     Mapped[InjuryType]   = mapped_column(Enum(InjuryType), default=InjuryType.none, nullable=False)
    statement:       Mapped[Optional[str]]     = mapped_column(Text)
    is_minor:        Mapped[bool]         = mapped_column(Boolean, default=False, nullable=False)
    is_anonymous:    Mapped[bool]         = mapped_column(Boolean, default=False, nullable=False)

    fir: Mapped["FIR"] = relationship("FIR", back_populates="victims")

    def __repr__(self) -> str:
        return f"<Victim id={self.id} name={self.full_name!r}>"
