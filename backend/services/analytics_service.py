from sqlalchemy.orm import Session
from sqlalchemy import func
from models.fir import FIR, FIRStatus
from models.crime_type import CrimeType
from models.suspect import Suspect, SuspectFIR
from schemas.analytics import (
    AnalyticsSummary, HotspotPoint, TrendPoint,
    CrimeTypeCount, NetworkGraph, NetworkNode, NetworkEdge,
)
from core.logging import get_logger

logger = get_logger(__name__)


def get_summary(db: Session) -> AnalyticsSummary:
    total  = db.query(func.count(FIR.id)).scalar() or 0
    open_c = db.query(func.count(FIR.id)).filter(FIR.status == FIRStatus.filed).scalar() or 0
    closed = db.query(func.count(FIR.id)).filter(
        FIR.status.in_([FIRStatus.closed_true, FIRStatus.closed_false])
    ).scalar() or 0
    invest = db.query(func.count(FIR.id)).filter(
        FIR.status == FIRStatus.under_investigation
    ).scalar() or 0

    return AnalyticsSummary(
        total_crimes=total,
        open_cases=open_c,
        closed_cases=closed,
        under_investigation=invest,
        hotspots=get_hotspots(db),
        trends=get_trends(db),
        by_type=get_by_type(db),
    )


def get_hotspots(db: Session, limit: int = 20) -> list[HotspotPoint]:
    rows = (
        db.query(
            func.round(FIR.latitude, 2).label("lat"),
            func.round(FIR.longitude, 2).label("lng"),
            func.count(FIR.id).label("count"),
        )
        .filter(FIR.latitude.isnot(None), FIR.longitude.isnot(None))
        .group_by("lat", "lng")
        .order_by(func.count(FIR.id).desc())
        .limit(limit)
        .all()
    )
    return [HotspotPoint(lat=float(r.lat), lng=float(r.lng), count=r.count) for r in rows]


def get_trends(db: Session) -> list[TrendPoint]:
    rows = (
        db.query(
            func.date_format(FIR.incident_date, "%Y-%m").label("month"),
            func.count(FIR.id).label("total"),
        )
        .filter(FIR.incident_date.isnot(None))
        .group_by("month")
        .order_by("month")
        .all()
    )
    return [TrendPoint(month=r.month, total=r.total) for r in rows]


def get_by_type(db: Session) -> list[CrimeTypeCount]:
    rows = (
        db.query(CrimeType.name.label("crime_type"), func.count(FIR.id).label("total"))
        .join(FIR, FIR.crime_type_id == CrimeType.id)
        .group_by(CrimeType.name)
        .order_by(func.count(FIR.id).desc())
        .all()
    )
    return [CrimeTypeCount(crime_type=r.crime_type, total=r.total) for r in rows]


def get_network_graph(db: Session) -> NetworkGraph:
    """Builds a Cytoscape-compatible node/edge graph of suspect-FIR relationships."""
    from models.fir import FIR

    suspects = db.query(Suspect).limit(100).all()
    links = db.query(SuspectFIR).all()
    fir_ids = {lnk.fir_id for lnk in links}
    firs = {f.id: f for f in db.query(FIR).filter(FIR.id.in_(fir_ids)).all()} if fir_ids else {}

    nodes: list[NetworkNode] = []
    edges: list[NetworkEdge] = []
    seen: set[str] = set()

    for fir in firs.values():
        nid = f"fir-{fir.id}"
        if nid not in seen:
            nodes.append(NetworkNode(id=nid, label=fir.fir_number, type="crime"))
            seen.add(nid)

    for suspect in suspects:
        sid = f"suspect-{suspect.id}"
        if sid not in seen:
            nodes.append(NetworkNode(id=sid, label=suspect.full_name or "Unknown", type="suspect"))
            seen.add(sid)

    for lnk in links:
        fir_nid = f"fir-{lnk.fir_id}"
        sus_nid = f"suspect-{lnk.suspect_id}"
        if fir_nid in seen and sus_nid in seen:
            edges.append(NetworkEdge(source=sus_nid, target=fir_nid, label=lnk.role_in_case or "linked_to"))

    return NetworkGraph(nodes=nodes, edges=edges)
