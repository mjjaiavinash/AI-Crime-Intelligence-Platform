from typing import Optional
import enum
from datetime import datetime
from sqlalchemy import String, Text, Enum, ForeignKey, Numeric, DateTime, Date, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from models.mixins import TimestampMixin


class FIRStatus(str, enum.Enum):
    filed               = "filed"
    under_investigation = "under_investigation"
    charge_sheet_filed  = "charge_sheet_filed"
    closed_true         = "closed_true"
    closed_false        = "closed_false"
    referred_to_court   = "referred_to_court"


class FIR(Base, TimestampMixin):
    __tablename__ = "fir"

    id:                  Mapped[int]          = mapped_column(primary_key=True, index=True)
    fir_number:          Mapped[str]          = mapped_column(String(50),  unique=True, nullable=False, index=True)
    station_id:          Mapped[int]          = mapped_column(ForeignKey("police_stations.id", ondelete="RESTRICT"), nullable=False, index=True)
    district_id:         Mapped[int]          = mapped_column(ForeignKey("districts.id",       ondelete="RESTRICT"), nullable=False, index=True)
    crime_type_id:       Mapped[int]          = mapped_column(ForeignKey("crime_types.id",     ondelete="RESTRICT"), nullable=False, index=True)
    io_officer_id:       Mapped[Optional[int]]     = mapped_column(ForeignKey("officers.id",        ondelete="SET NULL"))
    filed_by_officer_id: Mapped[Optional[int]]     = mapped_column(ForeignKey("officers.id",        ondelete="SET NULL"))
    title:               Mapped[str]          = mapped_column(String(255), nullable=False)
    description:         Mapped[Optional[str]]     = mapped_column(Text)
    incident_date:       Mapped[datetime]     = mapped_column(DateTime(timezone=True), nullable=False)
    reported_date:       Mapped[datetime]     = mapped_column(DateTime(timezone=True), nullable=False)
    location_name:       Mapped[Optional[str]]     = mapped_column(String(255))
    latitude:            Mapped[Optional[float]]   = mapped_column(Numeric(10, 8))
    longitude:           Mapped[Optional[float]]   = mapped_column(Numeric(11, 8))
    address:             Mapped[Optional[str]]     = mapped_column(String(500))
    status:              Mapped[FIRStatus]    = mapped_column(Enum(FIRStatus), default=FIRStatus.filed, nullable=False, index=True)
    court_name:          Mapped[Optional[str]]     = mapped_column(String(200))
    court_case_number:   Mapped[Optional[str]]     = mapped_column(String(100))
    next_hearing_date:   Mapped[Optional[datetime]]= mapped_column(Date)
    is_sensitive:        Mapped[bool]         = mapped_column(Boolean, default=False, nullable=False)

    station:       Mapped["PoliceStation"] = relationship("PoliceStation", back_populates="firs",            lazy="joined")
    crime_type_rel:Mapped["CrimeType"]     = relationship("CrimeType",     back_populates="firs",            lazy="joined")
    io_officer:    Mapped["Optional[Officer]"]  = relationship("Officer", foreign_keys=[io_officer_id],           lazy="joined")
    filed_by:      Mapped["Optional[Officer]"]  = relationship("Officer", foreign_keys=[filed_by_officer_id],     lazy="joined")
    victims:       Mapped[list["Victim"]]  = relationship("Victim",  back_populates="fir", cascade="all, delete-orphan", lazy="select")
    suspect_links: Mapped[list["SuspectFIR"]] = relationship("SuspectFIR", back_populates="fir", cascade="all, delete-orphan", lazy="select")
    suspects:      Mapped[list["Suspect"]]    = relationship("Suspect", secondary="suspect_fir", back_populates="firs", viewonly=True)

    def __repr__(self) -> str:
        return f"<FIR id={self.id} number={self.fir_number!r} status={self.status}>"
