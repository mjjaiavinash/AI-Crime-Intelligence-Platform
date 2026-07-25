from datetime import datetime, date
from typing import Optional
from pydantic import field_validator
from models.fir import FIRStatus
from schemas.base import APIBase


class FIRCreate(APIBase):
    fir_number:          str
    station_id:          int
    district_id:         int
    crime_type_id:       int
    io_officer_id:       Optional[int]      = None
    filed_by_officer_id: Optional[int]      = None
    title:               str
    description:         Optional[str]      = None
    incident_date:       datetime
    reported_date:       datetime
    location_name:       Optional[str]      = None
    latitude:            Optional[float]    = None
    longitude:           Optional[float]    = None
    address:             Optional[str]      = None
    status:              FIRStatus          = FIRStatus.filed
    court_name:          Optional[str]      = None
    court_case_number:   Optional[str]      = None
    next_hearing_date:   Optional[date]     = None
    is_sensitive:        bool               = False

    @field_validator("title", "fir_number")
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


class FIRUpdate(APIBase):
    title:               Optional[str]      = None
    description:         Optional[str]      = None
    crime_type_id:       Optional[int]      = None
    io_officer_id:       Optional[int]      = None
    location_name:       Optional[str]      = None
    latitude:            Optional[float]    = None
    longitude:           Optional[float]    = None
    address:             Optional[str]      = None
    status:              Optional[FIRStatus]= None
    court_name:          Optional[str]      = None
    court_case_number:   Optional[str]      = None
    next_hearing_date:   Optional[date]     = None
    is_sensitive:        Optional[bool]     = None


class FIROfficerRead(APIBase):
    id:           int
    badge_number: str
    rank:         str
    user:         Optional['FIROfficerUserRead'] = None


class FIROfficerUserRead(APIBase):
    id:        int
    username:  str
    full_name: Optional[str]


class FIRCrimeTypeRead(APIBase):
    id:       int
    name:     str
    category: str
    severity: str


class FIRStationRead(APIBase):
    id:           int
    name:         str
    station_code: str


class FIRRead(APIBase):
    id:                  int
    fir_number:          str
    title:               str
    description:         Optional[str]
    status:              FIRStatus
    incident_date:       datetime
    reported_date:       datetime
    location_name:       Optional[str]
    latitude:            Optional[float]
    longitude:           Optional[float]
    address:             Optional[str]
    is_sensitive:        bool
    court_name:          Optional[str]
    court_case_number:   Optional[str]
    next_hearing_date:   Optional[date]
    station_id:          int
    district_id:         int
    crime_type_id:       int
    io_officer_id:       Optional[int]
    filed_by_officer_id: Optional[int]
    station:             Optional[FIRStationRead]
    crime_type_rel:      Optional[FIRCrimeTypeRead]
    io_officer:          Optional[FIROfficerRead]
    created_at:          datetime
    updated_at:          datetime


class FIRSummary(APIBase):
    id:             int
    fir_number:     str
    title:          str
    status:         FIRStatus
    incident_date:  datetime
    location_name:  Optional[str]
    latitude:       Optional[float]
    longitude:      Optional[float]
    station_id:     int
    crime_type_id:  int
    io_officer_id:  Optional[int]
    io_officer:     Optional[FIROfficerRead]
    created_at:     datetime
