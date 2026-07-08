from typing import Optional
from datetime import datetime
from pydantic import field_validator
from models.crime import CrimeStatus
from schemas.base import APIBase


class SuspectRead(APIBase):
    id: int
    name: Optional[str]
    alias: Optional[str]
    description: Optional[str]


class EvidenceRead(APIBase):
    id: int
    file_path: Optional[str]
    file_type: Optional[str]
    description: Optional[str]


class CrimeCreate(APIBase):
    title: str
    description: Optional[str] = None
    crime_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    occurred_at: Optional[datetime] = None
    status: CrimeStatus = CrimeStatus.open

    @field_validator("latitude")
    @classmethod
    def validate_lat(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (-90 <= v <= 90):
            raise ValueError("Latitude must be between -90 and 90.")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_lng(cls, v: Optional[float]) -> Optional[float]:
        if v is not None and not (-180 <= v <= 180):
            raise ValueError("Longitude must be between -180 and 180.")
        return v


class CrimeUpdate(APIBase):
    title: Optional[str] = None
    description: Optional[str] = None
    crime_type: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    occurred_at: Optional[datetime] = None
    status: Optional[CrimeStatus] = None


class CrimeRead(APIBase):
    id: int
    title: str
    description: Optional[str]
    crime_type: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    location_name: Optional[str]
    occurred_at: Optional[datetime]
    status: CrimeStatus
    reported_by: Optional[int]
    created_at: datetime
    suspects: list[SuspectRead] = []
    evidence: list[EvidenceRead] = []


class CrimeSummary(APIBase):
    """Lightweight version for list endpoints — no nested relations."""
    id: int
    title: str
    crime_type: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    location_name: Optional[str]
    status: CrimeStatus
    occurred_at: Optional[datetime]
    created_at: datetime
