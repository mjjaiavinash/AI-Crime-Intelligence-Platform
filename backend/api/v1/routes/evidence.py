from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user, require_role
from schemas.evidence import EvidenceCreate, EvidenceUpdate, EvidenceRead, EvidenceSummary
from schemas.base import PaginatedResponse
from services import evidence_service

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get(
    "",
    response_model=PaginatedResponse[EvidenceSummary],
    summary="List evidence items",
)
def list_evidence(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    fir_id: Optional[int] = Query(None, description="Filter by FIR ID"),
    db: Session = Depends(get_db),
):
    return evidence_service.list_evidence(db, page, page_size, fir_id)


@router.get(
    "/{evidence_id}",
    response_model=EvidenceRead,
    summary="Get evidence by ID",
)
def get_evidence(evidence_id: int, db: Session = Depends(get_db)):
    return evidence_service.get_evidence(db, evidence_id)


@router.post(
    "",
    response_model=EvidenceRead,
    status_code=201,
    summary="Create evidence — admin | supervisor | investigator",
)
def create_evidence(
    payload: EvidenceCreate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor", "investigator")),
):
    return evidence_service.create_evidence(db, payload)


@router.patch(
    "/{evidence_id}",
    response_model=EvidenceRead,
    summary="Update evidence — admin | supervisor | investigator",
)
def update_evidence(
    evidence_id: int,
    payload: EvidenceUpdate,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor", "investigator")),
):
    return evidence_service.update_evidence(db, evidence_id, payload)


@router.delete(
    "/{evidence_id}",
    status_code=204,
    summary="Delete evidence — admin | supervisor only",
)
def delete_evidence(
    evidence_id: int,
    db: Session = Depends(get_db),
    _: dict = Depends(require_role("admin", "supervisor")),
):
    evidence_service.delete_evidence(db, evidence_id)
