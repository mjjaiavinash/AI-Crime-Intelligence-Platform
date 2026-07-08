from datetime import datetime, date
from typing import Optional
from models.victim import InjuryType
from schemas.base import APIBase


class VictimCreate(APIBase):
    fir_id:          int
    full_name:       str
    alias:           Optional[str]         = None
    gender:          str                   = "unknown"
    date_of_birth:   Optional[date]        = None
    age_at_incident: Optional[int]         = None
    nationality:     Optional[str]         = "Indian"
    id_type:         Optional[str]         = None
    id_number:       Optional[str]         = None
    phone:           Optional[str]         = None
    email:           Optional[str]         = None
    address:         Optional[str]         = None
    injury_type:     InjuryType            = InjuryType.none
    statement:       Optional[str]         = None
    is_minor:        bool                  = False
    is_anonymous:    bool                  = False


class VictimUpdate(APIBase):
    full_name:       Optional[str]         = None
    alias:           Optional[str]         = None
    gender:          Optional[str]         = None
    date_of_birth:   Optional[date]        = None
    age_at_incident: Optional[int]         = None
    phone:           Optional[str]         = None
    email:           Optional[str]         = None
    address:         Optional[str]         = None
    injury_type:     Optional[InjuryType]  = None
    statement:       Optional[str]         = None
    is_minor:        Optional[bool]        = None
    is_anonymous:    Optional[bool]        = None


class VictimRead(APIBase):
    id:              int
    fir_id:          int
    full_name:       str
    alias:           Optional[str]
    gender:          str
    date_of_birth:   Optional[date]
    age_at_incident: Optional[int]
    nationality:     Optional[str]
    id_type:         Optional[str]
    id_number:       Optional[str]
    phone:           Optional[str]
    email:           Optional[str]
    address:         Optional[str]
    injury_type:     InjuryType
    statement:       Optional[str]
    is_minor:        bool
    is_anonymous:    bool
    created_at:      datetime
    updated_at:      datetime


class VictimSummary(APIBase):
    id:          int
    fir_id:      int
    full_name:   str
    gender:      str
    injury_type: InjuryType
    is_minor:    bool
    created_at:  datetime
