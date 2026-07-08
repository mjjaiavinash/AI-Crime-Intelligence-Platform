from datetime import date, datetime
from typing import Optional
from models.vehicle import VehicleType, VehicleStatus
from schemas.base import APIBase


class VehicleBase(APIBase):
    suspect_id: Optional[int] = None
    fir_id: Optional[int] = None
    registration_number: Optional[str] = None
    chassis_number: Optional[str] = None
    engine_number: Optional[str] = None
    vehicle_type: VehicleType = VehicleType.car
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    year_of_manufacture: Optional[int] = None
    status: VehicleStatus = VehicleStatus.active
    seized_date: Optional[date] = None
    notes: Optional[str] = None


class VehicleCreate(VehicleBase):
    pass


class VehicleUpdate(APIBase):
    suspect_id: Optional[int] = None
    fir_id: Optional[int] = None
    registration_number: Optional[str] = None
    chassis_number: Optional[str] = None
    engine_number: Optional[str] = None
    vehicle_type: Optional[VehicleType] = None
    make: Optional[str] = None
    model: Optional[str] = None
    color: Optional[str] = None
    year_of_manufacture: Optional[int] = None
    status: Optional[VehicleStatus] = None
    seized_date: Optional[date] = None
    notes: Optional[str] = None


class VehicleRead(VehicleBase):
    id: int
    created_at: datetime
    updated_at: datetime


class VehicleSummary(APIBase):
    id: int
    registration_number: Optional[str] = None
    vehicle_type: VehicleType
    make: Optional[str] = None
    model: Optional[str] = None
    status: VehicleStatus
