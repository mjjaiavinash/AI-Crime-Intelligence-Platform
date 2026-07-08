from datetime import datetime
from typing import Optional
from pydantic import field_validator
from models.crime_type import CrimeTypeSeverity
from schemas.base import APIBase


class CrimeTypeCreate(APIBase):
    category:      str
    name:          str
    ipc_section:   Optional[str]              = None
    bns_section:   Optional[str]              = None
    description:   Optional[str]              = None
    severity:      CrimeTypeSeverity          = CrimeTypeSeverity.moderate
    is_cognizable: bool                       = True
    is_bailable:   bool                       = False

    @field_validator("name", "category")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be blank.")
        return v.strip()


class CrimeTypeUpdate(APIBase):
    category:      Optional[str]              = None
    name:          Optional[str]              = None
    ipc_section:   Optional[str]              = None
    bns_section:   Optional[str]              = None
    description:   Optional[str]              = None
    severity:      Optional[CrimeTypeSeverity]= None
    is_cognizable: Optional[bool]             = None
    is_bailable:   Optional[bool]             = None


class CrimeTypeRead(APIBase):
    id:            int
    category:      str
    name:          str
    ipc_section:   Optional[str]
    bns_section:   Optional[str]
    description:   Optional[str]
    severity:      CrimeTypeSeverity
    is_cognizable: bool
    is_bailable:   bool
    created_at:    datetime
