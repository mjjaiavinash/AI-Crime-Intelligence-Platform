from datetime import datetime
from typing import Optional
from pydantic import EmailStr, field_validator
from schemas.base import APIBase


class DistrictRead(APIBase):
    id:        int
    name:      str
    state:     str
    country:   str


class PoliceStationCreate(APIBase):
    district_id:  int
    name:         str
    station_code: str
    address:      Optional[str]   = None
    phone:        Optional[str]   = None
    email:        Optional[str]   = None
    latitude:     Optional[float] = None
    longitude:    Optional[float] = None

    @field_validator("name", "station_code")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be blank.")
        return v.strip()

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


class PoliceStationUpdate(APIBase):
    name:         Optional[str]   = None
    address:      Optional[str]   = None
    phone:        Optional[str]   = None
    email:        Optional[str]   = None
    latitude:     Optional[float] = None
    longitude:    Optional[float] = None
    is_active:    Optional[bool]  = None


class PoliceStationRead(APIBase):
    id:           int
    district_id:  int
    district:     Optional[DistrictRead]
    name:         str
    station_code: str
    address:      Optional[str]
    phone:        Optional[str]
    email:        Optional[str]
    latitude:     Optional[float]
    longitude:    Optional[float]
    is_active:    bool
    created_at:   datetime


class PoliceStationSummary(APIBase):
    id:           int
    name:         str
    station_code: str
    district_id:  int
    is_active:    bool
