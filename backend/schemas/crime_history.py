from datetime import date, datetime
from typing import Optional
from models.crime_history import HistoryOutcome
from schemas.base import APIBase


class CrimeHistoryBase(APIBase):
    suspect_id: int
    crime_type_id: Optional[int] = None
    fir_reference: Optional[str] = None
    fir_id: Optional[int] = None
    station_id: Optional[int] = None
    incident_date: Optional[date] = None
    description: Optional[str] = None
    outcome: HistoryOutcome = HistoryOutcome.pending
    sentence: Optional[str] = None
    release_date: Optional[date] = None


class CrimeHistoryCreate(CrimeHistoryBase):
    pass


class CrimeHistoryUpdate(APIBase):
    suspect_id: Optional[int] = None
    crime_type_id: Optional[int] = None
    fir_reference: Optional[str] = None
    fir_id: Optional[int] = None
    station_id: Optional[int] = None
    incident_date: Optional[date] = None
    description: Optional[str] = None
    outcome: Optional[HistoryOutcome] = None
    sentence: Optional[str] = None
    release_date: Optional[date] = None


class CrimeHistoryRead(CrimeHistoryBase):
    id: int
    created_at: datetime
    updated_at: datetime


class CrimeHistorySummary(APIBase):
    id: int
    suspect_id: int
    incident_date: Optional[date] = None
    outcome: HistoryOutcome
    description: Optional[str] = None
