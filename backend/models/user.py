from __future__ import annotations
from typing import Optional
import enum
from datetime import datetime
from sqlalchemy import String, Enum, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from models.mixins import TimestampMixin


class UserRole(str, enum.Enum):
    admin         = "admin"
    supervisor    = "supervisor"
    investigator  = "investigator"
    crime_analyst = "crime_analyst"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id:              Mapped[int]            = mapped_column(primary_key=True, index=True)
    username:        Mapped[str]            = mapped_column(String(100), unique=True, nullable=False, index=True)
    email:           Mapped[str]            = mapped_column(String(255), unique=True, nullable=False, index=True)
    full_name:       Mapped[Optional[str]]     = mapped_column(String(200), nullable=True)
    hashed_password: Mapped[str]            = mapped_column(String(255), nullable=False)
    role:            Mapped[UserRole]       = mapped_column(Enum(UserRole), default=UserRole.investigator, nullable=False)
    is_active:       Mapped[bool]           = mapped_column(Boolean, default=True, nullable=False)
    last_login_at:   Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    crimes: Mapped[list["Crime"]] = relationship("Crime", back_populates="reporter", lazy="select")

    def __repr__(self) -> str:
        return f"<User id={self.id} username={self.username!r} role={self.role}>"
