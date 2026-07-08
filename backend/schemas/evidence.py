from datetime import datetime
from typing import Optional
from models.evidence import EvidenceType, EvidenceStatus
from schemas.base import APIBase


class EvidenceBase(APIBase):
    fir_id: int
    collected_by: Optional[int] = None
    evidence_type: EvidenceType = EvidenceType.physical
    title: str
    description: Optional[str] = None
    file_path: Optional[str] = None
    file_name: Optional[str] = None
    file_type: Optional[str] = None
    file_size_kb: Optional[int] = None
    checksum_sha256: Optional[str] = None
    collection_date: Optional[datetime] = None
    collection_location: Optional[str] = None
    lab_reference: Optional[str] = None
    lab_report_path: Optional[str] = None
    status: EvidenceStatus = EvidenceStatus.collected
    is_tamper_evident: bool = False


class EvidenceCreate(EvidenceBase):
    pass


class EvidenceUpdate(APIBase):
    fir_id: Optional[int] = None
    collected_by: Optional[int] = None
    evidence_type: Optional[EvidenceType] = None
    title: Optional[str] = None
    description: Optional[str] = None
    file_path: Optional[str] = None
    file_name: Optional[str] = None
    file_type: Optional[str] = None
    file_size_kb: Optional[int] = None
    checksum_sha256: Optional[str] = None
    collection_date: Optional[datetime] = None
    collection_location: Optional[str] = None
    lab_reference: Optional[str] = None
    lab_report_path: Optional[str] = None
    status: Optional[EvidenceStatus] = None
    is_tamper_evident: Optional[bool] = None


class EvidenceRead(EvidenceBase):
    id: int
    created_at: datetime
    updated_at: datetime


class EvidenceSummary(APIBase):
    id: int
    fir_id: int
    evidence_type: EvidenceType
    title: str
    status: EvidenceStatus
    collection_date: Optional[datetime] = None
