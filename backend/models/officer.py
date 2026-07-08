from typing import Optional
from sqlalchemy import String, ForeignKey, Date, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from models.mixins import TimestampMixin
from datetime import date


class Officer(Base, TimestampMixin):
    __tablename__ = "officers"

    id:              Mapped[int]       = mapped_column(primary_key=True, index=True)
    user_id:         Mapped[int]       = mapped_column(ForeignKey("users.id",           ondelete="CASCADE"),  unique=True, nullable=False)
    station_id:      Mapped[int]       = mapped_column(ForeignKey("police_stations.id", ondelete="RESTRICT"), nullable=False, index=True)
    district_id:     Mapped[int]       = mapped_column(ForeignKey("districts.id",       ondelete="RESTRICT"), nullable=False, index=True)
    badge_number:    Mapped[str]       = mapped_column(String(50),  unique=True, nullable=False)
    rank:            Mapped[str]       = mapped_column(String(100), nullable=False)
    department:      Mapped[Optional[str]]  = mapped_column(String(150))
    date_of_joining: Mapped[Optional[date]] = mapped_column(Date)
    is_active:       Mapped[bool]      = mapped_column(Boolean, default=True, nullable=False)

    user:    Mapped["User"]          = relationship("User",          foreign_keys=[user_id],    lazy="joined")
    station: Mapped["PoliceStation"] = relationship("PoliceStation", back_populates="officers", lazy="joined")

    def __repr__(self) -> str:
        return f"<Officer id={self.id} badge={self.badge_number!r} rank={self.rank!r}>"
