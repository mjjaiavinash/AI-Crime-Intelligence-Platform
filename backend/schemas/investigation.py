from datetime import date, datetime
from typing import Optional, List
from models.investigation import InvestigationStatus, InvestigationOutcome, NoteType
from schemas.base import APIBase


# ── Investigation Note ────────────────────────────────────────────────────────
class InvestigationNoteBase(APIBase):
    investigation_id: int
    officer_id: Optional[int] = None
    note: str
    note_type: NoteType = NoteType.general
    is_confidential: bool = False


class InvestigationNoteCreate(InvestigationNoteBase):
    pass


class InvestigationNoteRead(InvestigationNoteBase):
    id: int
    created_at: datetime


# ── Investigation Officer ─────────────────────────────────────────────────────
class InvestigationOfficerBase(APIBase):
    investigation_id: int
    officer_id: int
    role: Optional[str] = None
    relieved_at: Optional[datetime] = None


class InvestigationOfficerCreate(InvestigationOfficerBase):
    pass


class InvestigationOfficerRead(InvestigationOfficerBase):
    assigned_at: datetime


# ── Investigation ─────────────────────────────────────────────────────────────
class InvestigationBase(APIBase):
    fir_id: int
    lead_officer_id: Optional[int] = None
    start_date: date
    target_close_date: Optional[date] = None
    actual_close_date: Optional[date] = None
    status: InvestigationStatus = InvestigationStatus.initiated
    outcome: InvestigationOutcome = InvestigationOutcome.pending
    outcome_summary: Optional[str] = None
    supervisor_id: Optional[int] = None
    reviewed_at: Optional[datetime] = None


class InvestigationCreate(InvestigationBase):
    pass


class InvestigationUpdate(APIBase):
    fir_id: Optional[int] = None
    lead_officer_id: Optional[int] = None
    start_date: Optional[date] = None
    target_close_date: Optional[date] = None
    actual_close_date: Optional[date] = None
    status: Optional[InvestigationStatus] = None
    outcome: Optional[InvestigationOutcome] = None
    outcome_summary: Optional[str] = None
    supervisor_id: Optional[int] = None
    reviewed_at: Optional[datetime] = None


class InvestigationRead(InvestigationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    notes: List[InvestigationNoteRead] = []


class InvestigationSummary(APIBase):
    id: int
    fir_id: int
    lead_officer_id: Optional[int] = None
    status: InvestigationStatus
    outcome: InvestigationOutcome
    start_date: date
