from datetime import datetime
from typing import Optional
from models.mobile_number import SIMType
from schemas.base import APIBase


class MobileNumberBase(APIBase):
    suspect_id: Optional[int] = None
    fir_id: Optional[int] = None
    mobile_number: str
    country_code: str = "+91"
    operator: Optional[str] = None
    sim_type: SIMType = SIMType.unknown
    imei_number: Optional[str] = None
    imsi_number: Optional[str] = None
    registered_name: Optional[str] = None
    registered_address: Optional[str] = None
    is_verified: bool = False
    is_active: bool = True
    last_location: Optional[str] = None
    surveillance_flag: bool = False
    notes: Optional[str] = None


class MobileNumberCreate(MobileNumberBase):
    pass


class MobileNumberUpdate(APIBase):
    suspect_id: Optional[int] = None
    fir_id: Optional[int] = None
    mobile_number: Optional[str] = None
    country_code: Optional[str] = None
    operator: Optional[str] = None
    sim_type: Optional[SIMType] = None
    imei_number: Optional[str] = None
    imsi_number: Optional[str] = None
    registered_name: Optional[str] = None
    registered_address: Optional[str] = None
    is_verified: Optional[bool] = None
    is_active: Optional[bool] = None
    last_location: Optional[str] = None
    surveillance_flag: Optional[bool] = None
    notes: Optional[str] = None


class MobileNumberRead(MobileNumberBase):
    id: int
    created_at: datetime
    updated_at: datetime


class MobileNumberSummary(APIBase):
    id: int
    mobile_number: str
    operator: Optional[str] = None
    registered_name: Optional[str] = None
    surveillance_flag: bool
    is_active: bool
