from datetime import datetime
from typing import Optional
from models.suspect import ThreatLevel, ArrestStatus
from schemas.base import APIBase


class SuspectCreate(APIBase):
    fir_id:               int
    full_name:            Optional[str]          = None
    alias:                Optional[str]          = None
    gender:               str                    = "unknown"
    age_estimated:        Optional[int]          = None
    nationality:          Optional[str]          = "Indian"
    id_type:              Optional[str]          = None
    id_number:            Optional[str]          = None
    height_cm:            Optional[int]          = None
    weight_kg:            Optional[int]          = None
    complexion:           Optional[str]          = None
    build:                Optional[str]          = None
    distinguishing_marks: Optional[str]          = None
    phone:                Optional[str]          = None
    address:              Optional[str]          = None
    is_known_criminal:    bool                   = False
    gang_affiliation:     Optional[str]          = None
    threat_level:         ThreatLevel            = ThreatLevel.low
    arrest_status:        ArrestStatus           = ArrestStatus.at_large
    role_in_case:         Optional[str]          = None


class SuspectUpdate(APIBase):
    full_name:            Optional[str]          = None
    alias:                Optional[str]          = None
    gender:               Optional[str]          = None
    age_estimated:        Optional[int]          = None
    height_cm:            Optional[int]          = None
    weight_kg:            Optional[int]          = None
    complexion:           Optional[str]          = None
    build:                Optional[str]          = None
    distinguishing_marks: Optional[str]          = None
    phone:                Optional[str]          = None
    address:              Optional[str]          = None
    is_known_criminal:    Optional[bool]         = None
    gang_affiliation:     Optional[str]          = None
    threat_level:         Optional[ThreatLevel]  = None
    arrest_status:        Optional[ArrestStatus] = None
    role_in_case:         Optional[str]          = None


class SuspectRead(APIBase):
    id:                   int
    full_name:            Optional[str]
    alias:                Optional[str]
    gender:               str
    age_estimated:        Optional[int]
    nationality:          Optional[str]
    id_type:              Optional[str]
    id_number:            Optional[str]
    height_cm:            Optional[int]
    weight_kg:            Optional[int]
    complexion:           Optional[str]
    build:                Optional[str]
    distinguishing_marks: Optional[str]
    phone:                Optional[str]
    address:              Optional[str]
    is_known_criminal:    bool
    gang_affiliation:     Optional[str]
    threat_level:         ThreatLevel
    arrest_status:        ArrestStatus
    arrested_at:          Optional[datetime]
    created_at:           datetime
    updated_at:           datetime


class SuspectSummary(APIBase):
    id:            int
    full_name:     Optional[str]
    alias:         Optional[str]
    gender:        str
    age_estimated: Optional[int]
    threat_level:  ThreatLevel
    arrest_status: ArrestStatus
    gang_affiliation: Optional[str]
    is_known_criminal: bool
    created_at:    datetime
