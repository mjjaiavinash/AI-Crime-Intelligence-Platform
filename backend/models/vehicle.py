from typing import Optional
import enum
from datetime import date
from sqlalchemy import String, Integer, ForeignKey, Enum, Date, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from models.mixins import TimestampMixin


class VehicleType(str, enum.Enum):
    car = "car"
    motorcycle = "motorcycle"
    truck = "truck"
    bus = "bus"
    auto_rickshaw = "auto_rickshaw"
    bicycle = "bicycle"
    boat = "boat"
    other = "other"


class VehicleStatus(str, enum.Enum):
    active = "active"
    seized = "seized"
    stolen = "stolen"
    recovered = "recovered"
    destroyed = "destroyed"


class Vehicle(Base, TimestampMixin):
    __tablename__ = "vehicles"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    suspect_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("suspects.id", ondelete="SET NULL"), nullable=True, index=True
    )
    fir_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("fir.id", ondelete="SET NULL"), nullable=True, index=True
    )
    registration_number: Mapped[Optional[str]] = mapped_column(String(30))
    chassis_number: Mapped[Optional[str]] = mapped_column(String(50))
    engine_number: Mapped[Optional[str]] = mapped_column(String(50))
    vehicle_type: Mapped[VehicleType] = mapped_column(
        Enum(VehicleType), default=VehicleType.car, nullable=False
    )
    make: Mapped[Optional[str]] = mapped_column(String(100))
    model: Mapped[Optional[str]] = mapped_column(String(100))
    color: Mapped[Optional[str]] = mapped_column(String(50))
    year_of_manufacture: Mapped[Optional[int]] = mapped_column(Integer)
    status: Mapped[VehicleStatus] = mapped_column(
        Enum(VehicleStatus), default=VehicleStatus.active, nullable=False
    )
    seized_date: Mapped[Optional[date]] = mapped_column(Date)
    notes: Mapped[Optional[str]] = mapped_column(Text)

    suspect: Mapped["Suspect"] = relationship("Suspect", foreign_keys=[suspect_id])
    fir: Mapped["FIR"] = relationship("FIR", foreign_keys=[fir_id])

    def __repr__(self) -> str:
        return f"<Vehicle id={self.id} reg={self.registration_number!r} type={self.vehicle_type}>"
