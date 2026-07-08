from typing import Optional
import enum
from datetime import datetime
from sqlalchemy import String, Text, Enum, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from core.database import Base
from models.mixins import TimestampMixin


class CrimeTypeSeverity(str, enum.Enum):
    petty    = "petty"
    minor    = "minor"
    moderate = "moderate"
    serious  = "serious"
    heinous  = "heinous"


class CrimeType(Base, TimestampMixin):
    __tablename__ = "crime_types"

    id:            Mapped[int]               = mapped_column(primary_key=True, index=True)
    category:      Mapped[str]               = mapped_column(String(100), nullable=False, index=True)
    name:          Mapped[str]               = mapped_column(String(150), unique=True, nullable=False)
    ipc_section:   Mapped[Optional[str]]        = mapped_column(String(50))
    bns_section:   Mapped[Optional[str]]        = mapped_column(String(50))
    description:   Mapped[Optional[str]]        = mapped_column(Text)
    severity:      Mapped[CrimeTypeSeverity] = mapped_column(
                       Enum(CrimeTypeSeverity), default=CrimeTypeSeverity.moderate, nullable=False
                   )
    is_cognizable: Mapped[bool]              = mapped_column(Boolean, default=True,  nullable=False)
    is_bailable:   Mapped[bool]              = mapped_column(Boolean, default=False, nullable=False)

    firs: Mapped[list["FIR"]] = relationship("FIR", back_populates="crime_type_rel", lazy="select")

    def __repr__(self) -> str:
        return f"<CrimeType id={self.id} name={self.name!r}>"
