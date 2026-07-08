from typing import Optional
from sqlalchemy import String, ForeignKey, Numeric, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from models.mixins import TimestampMixin


class District(Base, TimestampMixin):
    __tablename__ = "districts"

    id:        Mapped[int]        = mapped_column(primary_key=True, index=True)
    name:      Mapped[str]        = mapped_column(String(100), nullable=False)
    state:     Mapped[str]        = mapped_column(String(100), nullable=False)
    country:   Mapped[str]        = mapped_column(String(100), nullable=False, default="India")
    latitude:  Mapped[Optional[float]] = mapped_column(Numeric(10, 8))
    longitude: Mapped[Optional[float]] = mapped_column(Numeric(11, 8))

    stations: Mapped[list["PoliceStation"]] = relationship(
        "PoliceStation", back_populates="district", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<District id={self.id} name={self.name!r}>"


class PoliceStation(Base, TimestampMixin):
    __tablename__ = "police_stations"

    id:           Mapped[int]        = mapped_column(primary_key=True, index=True)
    district_id:  Mapped[int]        = mapped_column(ForeignKey("districts.id", ondelete="RESTRICT"), nullable=False, index=True)
    name:         Mapped[str]        = mapped_column(String(150), nullable=False)
    station_code: Mapped[str]        = mapped_column(String(30),  unique=True, nullable=False)
    address:      Mapped[Optional[str]]   = mapped_column(String(500))
    phone:        Mapped[Optional[str]]   = mapped_column(String(20))
    email:        Mapped[Optional[str]]   = mapped_column(String(255))
    latitude:     Mapped[Optional[float]] = mapped_column(Numeric(10, 8))
    longitude:    Mapped[Optional[float]] = mapped_column(Numeric(11, 8))
    is_active:    Mapped[bool]       = mapped_column(Boolean, default=True, nullable=False)

    district: Mapped["District"]       = relationship("District", back_populates="stations")
    officers: Mapped[list["Officer"]]  = relationship("Officer", back_populates="station", lazy="select")
    firs:     Mapped[list["FIR"]]      = relationship("FIR", back_populates="station", lazy="select")

    def __repr__(self) -> str:
        return f"<PoliceStation id={self.id} code={self.station_code!r}>"
