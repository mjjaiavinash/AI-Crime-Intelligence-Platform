from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from core.security import get_current_user
from models.fir import FIR
from models.suspect import Suspect, SuspectFIR
from models.evidence import Evidence
from models.investigation import Investigation, InvestigationNote
from ai.pipelines.report_pipeline import generate_case_summary, generate_timeline, generate_risk_analysis

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.get(
    "/case-summary/{fir_id}",
    summary="Get AI-generated case intelligence summary — all roles",
)
def get_case_summary(fir_id: int, db: Session = Depends(get_db)):
    """
    Gathers all entities associated with an FIR (victims, suspects, evidence, notes)
    and uses Groq to generate a professional executive case brief with confidence scores.
    """
    fir = db.get(FIR, fir_id)
    if not fir:
        raise HTTPException(status_code=404, detail="FIR not found")

    # Gather victims
    victims_text = "\n".join([f"- {v.full_name} (Gender: {v.gender}, Injury: {v.injury_type.value if hasattr(v.injury_type, 'value') else str(v.injury_type)})" for v in fir.victims])

    # Gather suspects
    suspect_links = db.query(SuspectFIR).filter(SuspectFIR.fir_id == fir_id).all()
    suspects_text = ""
    for link in suspect_links:
        s = db.get(Suspect, link.suspect_id)
        if s:
            suspects_text += f"- {s.full_name} (Alias: {s.alias or 'None'}, Role in Case: {link.role_in_case or 'Unknown'}, Threat: {s.threat_level.value if hasattr(s.threat_level, 'value') else str(s.threat_level)}, Status: {s.arrest_status.value if hasattr(s.arrest_status, 'value') else str(s.arrest_status)})\n"

    # Gather evidence
    evidence = db.query(Evidence).filter(Evidence.fir_id == fir_id).all()
    evidence_text = "\n".join([f"- {e.title}: {e.description or 'No desc'} (Type: {e.evidence_type.value if hasattr(e.evidence_type, 'value') else str(e.evidence_type)}, Status: {e.status.value if hasattr(e.status, 'value') else str(e.status)})" for e in evidence])

    # Gather notes
    inv = db.query(Investigation).filter(Investigation.fir_id == fir_id).first()
    notes_text = ""
    if inv:
        notes = db.query(InvestigationNote).filter(InvestigationNote.investigation_id == inv.id).all()
        notes_text = "\n".join([f"- [{n.note_type.value if hasattr(n.note_type, 'value') else str(n.note_type)}] {n.note}" for n in notes])

    # Format case data
    case_data = (
        f"FIR Number: {fir.fir_number}\n"
        f"Title: {fir.title}\n"
        f"Description: {fir.description or 'No description'}\n"
        f"Incident Date: {fir.incident_date}\n"
        f"Location: {fir.location_name or 'Unknown'} (Lat: {fir.latitude}, Lng: {fir.longitude})\n"
        f"Status: {fir.status.value if hasattr(fir.status, 'value') else str(fir.status)}\n\n"
        f"Victims:\n{victims_text or 'None'}\n\n"
        f"Suspects:\n{suspects_text or 'None'}\n\n"
        f"Evidence Collected:\n{evidence_text or 'None'}\n\n"
        f"Investigation Notes:\n{notes_text or 'None'}"
    )

    summary = generate_case_summary(case_data)
    
    # Calculate synthetic confidence score based on completeness of evidence/records
    confidence_score = 0.5
    if len(evidence) > 0:
        confidence_score += 0.2
    if len(suspect_links) > 0:
        confidence_score += 0.15
    if inv and len(notes) > 1:
        confidence_score += 0.15

    return {
        "fir_id": fir_id,
        "fir_number": fir.fir_number,
        "summary": summary,
        "confidence_score": min(confidence_score, 1.0),
        "supporting_sources": ["fir_record", "victim_profiles", "suspect_profiles", "evidence_ledger", "officer_notes"]
    }


@router.get(
    "/timeline/{fir_id}",
    summary="Get AI-generated chronological case timeline — all roles",
)
def get_case_timeline(fir_id: int, db: Session = Depends(get_db)):
    """Extracts all timestamped notes, arrest events, and collection dates to construct a timeline."""
    fir = db.get(FIR, fir_id)
    if not fir:
        raise HTTPException(status_code=404, detail="FIR not found")

    events = []
    
    # Add FIR filed event
    events.append(f"{fir.reported_date}: [FIR Filed] - {fir.title} filed at station")
    
    # Add evidence collection events
    evidence = db.query(Evidence).filter(Evidence.fir_id == fir_id).all()
    for e in evidence:
        if e.collection_date:
            events.append(f"{e.collection_date}: [Evidence Collected] - {e.title} ({e.evidence_type.value if hasattr(e.evidence_type, 'value') else str(e.evidence_type)})")

    # Add notes
    inv = db.query(Investigation).filter(Investigation.fir_id == fir_id).first()
    if inv:
        notes = db.query(InvestigationNote).filter(InvestigationNote.investigation_id == inv.id).all()
        for n in notes:
            events.append(f"{n.created_at}: [Note Added] - {n.note} (Type: {n.note_type.value if hasattr(n.note_type, 'value') else str(n.note_type)})")

    log_data = "\n".join(events)
    timeline = generate_timeline(log_data)
    
    return {
        "fir_id": fir_id,
        "timeline": timeline,
        "raw_events_count": len(events)
    }


@router.get(
    "/suspect-profile/{suspect_id}",
    summary="Get AI suspect profile & recidivism risk explanation — all roles",
)
def get_suspect_profile(suspect_id: int, db: Session = Depends(get_db)):
    """Generates detailed behavioral profiling, recidivism risk explanation, and containment advice."""
    suspect = db.get(Suspect, suspect_id)
    if not suspect:
        raise HTTPException(status_code=404, detail="Suspect not found")

    # Gather prior crime history
    history = db.query(suspect.crime_history.__class__ if hasattr(suspect, "crime_history") else Suspect).filter_by(id=suspect_id).first() # Fallback check
    # Let's query directly from CrimeHistory table
    from models.crime_history import CrimeHistory
    prior_records = db.query(CrimeHistory).filter(CrimeHistory.suspect_id == suspect_id).all()
    history_text = "\n".join([f"- Date: {r.incident_date}, Outcome: {r.outcome.value if hasattr(r.outcome, 'value') else str(r.outcome)}, Sentence: {r.sentence or 'None'}" for r in prior_records])

    # Gather vehicles
    from models.vehicle import Vehicle
    vehicles = db.query(Vehicle).filter(Vehicle.suspect_id == suspect_id).all()
    vehicles_text = "\n".join([f"- {v.make} {v.model} ({v.registration_number}), Status: {v.status.value if hasattr(v.status, 'value') else str(v.status)}" for v in vehicles])

    # Format suspect details
    suspect_data = (
        f"Name: {suspect.full_name}\n"
        f"Alias: {suspect.alias or 'None'}\n"
        f"Threat Level: {suspect.threat_level.value if hasattr(suspect.threat_level, 'value') else str(suspect.threat_level)}\n"
        f"Arrest Status: {suspect.arrest_status.value if hasattr(suspect.arrest_status, 'value') else str(suspect.arrest_status)}\n"
        f"Gang Affiliation: {suspect.gang_affiliation or 'None'}\n\n"
        f"Prior Criminal Record:\n{history_text or 'None'}\n\n"
        f"Linked Vehicles:\n{vehicles_text or 'None'}"
    )

    analysis = generate_risk_analysis(suspect_data)

    return {
        "suspect_id": suspect_id,
        "full_name": suspect.full_name,
        "profiling_analysis": analysis,
    }
