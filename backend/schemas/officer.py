from datetime import datetime, date
from typing import Optional
from schemas.base import APIBase


class OfficerCreate(APIBase):
    user_id:         int
    station_id:      int
    district_id:     int
    badge_number:    str
    rank:            str
    department:      Optional[str]  = None
    date_of_joining: Optional[date] = None


class OfficerUpdate(APIBase):
    station_id:      Optional[int]  = None
    district_id:     Optional[int]  = None
    rank:            Optional[str]  = None
    department:      Optional[str]  = None
    date_of_joining: Optional[date] = None
    is_active:       Optional[bool] = None


class OfficerUserRead(APIBase):
    id:        int
    username:  str
    full_name: Optional[str]
    email:     str


class OfficerStationRead(APIBase):
    id:           int
    name:         str
    station_code: str


class OfficerRead(APIBase):
    id:              int
    badge_number:    str
    rank:            str
    department:      Optional[str]
    date_of_joining: Optional[date]
    is_active:       bool
    station_id:      int
    district_id:     int
    user_id:         int
    user:            Optional[OfficerUserRead]
    station:         Optional[OfficerStationRead]
    created_at:      datetime


class OfficerSummary(APIBase):
    id:           int
    badge_number: str
    rank:         str
    department:   Optional[str]
    is_active:    bool
    station_id:   int
