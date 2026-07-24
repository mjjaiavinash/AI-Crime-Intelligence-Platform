from typing import Optional
import enum
from sqlalchemy import String, Text, Enum, ForeignKey, Numeric, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from core.database import Base
from models.mixins import TimestampMixin


class CrimeStatus(str, enum.Enum):
    open = "open"
    closed = "closed"
    under_investigation = "under_investigation"


class Crime(Base, TimestampMixin):
    __tablename__ = "crimes"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text)
    crime_type: Mapped[Optional[str]] = mapped_column(String(100), index=True)
    latitude: Mapped[Optional[float]] = mapped_column(Numeric(10, 8))
    longitude: Mapped[Optional[float]] = mapped_column(Numeric(11, 8))
    location_name: Mapped[Optional[str]] = mapped_column(String(255))
    occurred_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    status: Mapped[CrimeStatus] = mapped_column(Enum(CrimeStatus), default=CrimeStatus.open, nullable=False, index=True)
    reported_by: Mapped[Optional[int]] = mapped_column(nullable=True)


    def __repr__(self) -> str:
        return f"<Crime id={self.id} title={self.title!r} status={self.status}>"
