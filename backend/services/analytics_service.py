from sqlalchemy.orm import Session
from sqlalchemy import func, text
from models.crime import Crime, CrimeStatus
from models.suspect import Suspect
from schemas.analytics import (
    AnalyticsSummary, HotspotPoint, TrendPoint,
    CrimeTypeCount, NetworkGraph, NetworkNode, NetworkEdge,
)
from core.logging import get_logger

logger = get_logger(__name__)


def get_summary(db: Session) -> AnalyticsSummary:
    total = db.query(func.count(Crime.id)).scalar() or 0
    open_c = db.query(func.count(Crime.id)).filter(Crime.status == CrimeStatus.open).scalar() or 0
    closed = db.query(func.count(Crime.id)).filter(Crime.status == CrimeStatus.closed).scalar() or 0
    invest = db.query(func.count(Crime.id)).filter(Crime.status == CrimeStatus.under_investigation).scalar() or 0

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
            func.round(Crime.latitude, 2).label("lat"),
            func.round(Crime.longitude, 2).label("lng"),
            func.count(Crime.id).label("count"),
        )
        .filter(Crime.latitude.isnot(None), Crime.longitude.isnot(None))
        .group_by("lat", "lng")
        .order_by(func.count(Crime.id).desc())
        .limit(limit)
        .all()
    )
    return [HotspotPoint(lat=float(r.lat), lng=float(r.lng), count=r.count) for r in rows]


def get_trends(db: Session) -> list[TrendPoint]:
    rows = (
        db.query(
            func.date_format(Crime.occurred_at, "%Y-%m").label("month"),
            func.count(Crime.id).label("total"),
        )
        .filter(Crime.occurred_at.isnot(None))
        .group_by("month")
        .order_by("month")
        .all()
    )
    return [TrendPoint(month=r.month, total=r.total) for r in rows]


def get_by_type(db: Session) -> list[CrimeTypeCount]:
    rows = (
        db.query(Crime.crime_type, func.count(Crime.id).label("total"))
        .filter(Crime.crime_type.isnot(None))
        .group_by(Crime.crime_type)
        .order_by(func.count(Crime.id).desc())
        .all()
    )
    return [CrimeTypeCount(crime_type=r.crime_type, total=r.total) for r in rows]


def get_network_graph(db: Session) -> NetworkGraph:
    """Builds a Cytoscape-compatible node/edge graph of crime-suspect relationships."""
    crimes = db.query(Crime).limit(100).all()
    suspects = db.query(Suspect).all()

    nodes: list[NetworkNode] = []
    edges: list[NetworkEdge] = []
    seen: set[str] = set()

    for crime in crimes:
        nid = f"crime-{crime.id}"
        if nid not in seen:
            nodes.append(NetworkNode(id=nid, label=crime.title, type="crime"))
            seen.add(nid)
        if crime.location_name:
            lid = f"loc-{crime.location_name}"
            if lid not in seen:
                nodes.append(NetworkNode(id=lid, label=crime.location_name, type="location"))
                seen.add(lid)
            edges.append(NetworkEdge(source=nid, target=lid, label="occurred_at"))

    for suspect in suspects:
        sid = f"suspect-{suspect.id}"
        if sid not in seen:
            nodes.append(NetworkNode(id=sid, label=suspect.name or "Unknown", type="suspect"))
            seen.add(sid)
        edges.append(NetworkEdge(source=sid, target=f"crime-{suspect.crime_id}", label="linked_to"))

    return NetworkGraph(nodes=nodes, edges=edges)
