"""
api/v1/routes/reports.py
─────────────────────────
AI report generation — restricted to admin | supervisor | crime_analyst.
Investigators are read-only on reports.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import require_role
from schemas.report import ReportRequest, ReportRead
from services import report_service

router = APIRouter()


@router.post(
    "",
    response_model=ReportRead,
    status_code=201,
    summary="Generate AI intelligence report — admin | supervisor | crime_analyst",
)
def generate_report(
    payload:      ReportRequest,
    db:           Session = Depends(get_db),
    current_user: dict    = Depends(require_role("admin", "supervisor", "crime_analyst", "investigator")),
):
    """
    Generates a natural-language intelligence report using Groq LLM + RAG.
    Restricted to roles that have analytical access.
    """
    return report_service.generate_report(db, payload, int(current_user["sub"]))


@router.get(
    "/pdf/{fir_id}",
    summary="Export FIR case details as a PDF document — all roles",
)
def export_case_pdf(
    fir_id: int,
    db:     Session = Depends(get_db),
):
    """Generates a professional case dossier PDF complete with entity details and evidence ledger."""
    from services.pdf_service import generate_fir_pdf_report
    pdf_buffer = generate_fir_pdf_report(db, fir_id)
    if not pdf_buffer:
        raise HTTPException(status_code=404, detail="Case or FIR not found")
        
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=FIR_Report_{fir_id}.pdf"}
    )
