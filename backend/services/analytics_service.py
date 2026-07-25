from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, case
from models.fir import FIR, FIRStatus
from models.crime_type import CrimeType
from models.suspect import Suspect, SuspectFIR
from models.victim import Victim
from models.police_station import PoliceStation, District
from schemas.analytics import (
    AnalyticsSummary, HotspotPoint, TrendPoint,
    CrimeTypeCount, NetworkGraph, NetworkNode, NetworkEdge, EarlyWarningAlert, DistrictStat,
    SociologicalInsights, AgeGroupCount, GenderCount, ZoneCount, RecidivismPoint,
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


def get_by_district(db: Session) -> list[DistrictStat]:
    rows = (
        db.query(
            District.id.label("district_id"),
            District.name.label("district_name"),
            func.count(FIR.id).label("total"),
            func.sum(
                func.IF(FIR.status == FIRStatus.filed, 1, 0)
            ).label("open_cases"),
            func.sum(
                func.IF(FIR.status.in_([FIRStatus.closed_true, FIRStatus.closed_false]), 1, 0)
            ).label("closed_cases"),
            func.sum(
                func.IF(FIR.status == FIRStatus.under_investigation, 1, 0)
            ).label("under_investigation"),
        )
        .join(FIR, FIR.district_id == District.id)
        .group_by(District.id, District.name)
        .order_by(func.count(FIR.id).desc())
        .all()
    )
    return [
        DistrictStat(
            district_id=r.district_id,
            district_name=r.district_name,
            total=r.total,
            open_cases=int(r.open_cases or 0),
            closed_cases=int(r.closed_cases or 0),
            under_investigation=int(r.under_investigation or 0),
        )
        for r in rows
    ]


def _time_ago(dt: datetime) -> str:
    diff = datetime.utcnow() - dt.replace(tzinfo=None)
    if diff.days == 0:
        if diff.seconds < 3600:
            return f"{diff.seconds // 60} min ago"
        return f"{diff.seconds // 3600} hr ago"
    return f"{diff.days}d ago"


def _district_for_suspect(db: Session, suspect_id: int) -> str:
    row = (
        db.query(District.name)
        .join(PoliceStation, PoliceStation.district_id == District.id)
        .join(FIR, FIR.station_id == PoliceStation.id)
        .join(SuspectFIR, SuspectFIR.fir_id == FIR.id)
        .filter(SuspectFIR.suspect_id == suspect_id)
        .order_by(FIR.reported_date.desc())
        .first()
    )
    return row[0] if row else "Unknown"


def _district_for_gang(db: Session, gang_affiliation: str) -> str:
    row = (
        db.query(District.name)
        .join(PoliceStation, PoliceStation.district_id == District.id)
        .join(FIR, FIR.station_id == PoliceStation.id)
        .join(SuspectFIR, SuspectFIR.fir_id == FIR.id)
        .join(Suspect, Suspect.id == SuspectFIR.suspect_id)
        .filter(Suspect.gang_affiliation == gang_affiliation)
        .order_by(FIR.reported_date.desc())
        .first()
    )
    return row[0] if row else "Unknown"


def get_alerts(db: Session, limit: int = 5) -> list[EarlyWarningAlert]:
    alerts: list[EarlyWarningAlert] = []
    cutoff_30 = datetime.utcnow() - timedelta(days=30)
    cutoff_48h = datetime.utcnow() - timedelta(hours=48)

    # 1. Repeat offenders — suspects with 3+ FIRs in last 30 days
    repeat_rows = (
        db.query(
            Suspect.id,
            Suspect.full_name,
            func.count(SuspectFIR.fir_id).label("cnt"),
            func.max(FIR.reported_date).label("last_seen"),
        )
        .join(SuspectFIR, SuspectFIR.suspect_id == Suspect.id)
        .join(FIR, FIR.id == SuspectFIR.fir_id)
        .filter(FIR.reported_date >= cutoff_30)
        .group_by(Suspect.id, Suspect.full_name)
        .having(func.count(SuspectFIR.fir_id) >= 3)
        .order_by(func.count(SuspectFIR.fir_id).desc())
        .limit(2)
        .all()
    )
    for r in repeat_rows:
        district = _district_for_suspect(db, r.id)
        alerts.append(EarlyWarningAlert(
            id=f"repeat-{r.id}",
            type="repeat",
            severity="critical" if r.cnt >= 5 else "high",
            title="Repeat Offender Active",
            desc=f"Known offender {r.full_name or 'Unknown'} (ID #{r.id}) flagged — {r.cnt} incidents in last 30 days.",
            district=district,
            time=_time_ago(r.last_seen),
        ))

    # 2. Crime hotspots — location clusters with 5+ FIRs in last 48 hrs
    hotspot_rows = (
        db.query(
            func.round(FIR.latitude, 1).label("lat"),
            func.round(FIR.longitude, 1).label("lng"),
            func.count(FIR.id).label("cnt"),
            func.max(FIR.reported_date).label("last_seen"),
            func.min(FIR.location_name).label("loc"),
        )
        .filter(
            FIR.latitude.isnot(None),
            FIR.longitude.isnot(None),
            FIR.reported_date >= cutoff_48h,
        )
        .group_by("lat", "lng")
        .having(func.count(FIR.id) >= 5)
        .order_by(func.count(FIR.id).desc())
        .limit(2)
        .all()
    )
    for r in hotspot_rows:
        alerts.append(EarlyWarningAlert(
            id=f"hotspot-{r.lat}-{r.lng}",
            type="hotspot",
            severity="high",
            title="Emerging Crime Hotspot",
            desc=f"{r.cnt} incidents detected near {r.loc or 'unknown location'} in the last 48 hrs — above baseline.",
            district=r.loc or "Unknown",
            time=_time_ago(r.last_seen),
        ))

    # 3. Gang activity — gang affiliations linked to 3+ FIRs in last 30 days
    gang_rows = (
        db.query(
            Suspect.gang_affiliation,
            func.count(func.distinct(SuspectFIR.fir_id)).label("cnt"),
            func.max(FIR.reported_date).label("last_seen"),
        )
        .join(SuspectFIR, SuspectFIR.suspect_id == Suspect.id)
        .join(FIR, FIR.id == SuspectFIR.fir_id)
        .filter(
            Suspect.gang_affiliation.isnot(None),
            FIR.reported_date >= cutoff_30,
        )
        .group_by(Suspect.gang_affiliation)
        .having(func.count(func.distinct(SuspectFIR.fir_id)) >= 3)
        .order_by(func.count(func.distinct(SuspectFIR.fir_id)).desc())
        .limit(1)
        .all()
    )
    for r in gang_rows:
        district = _district_for_gang(db, r.gang_affiliation)
        alerts.append(EarlyWarningAlert(
            id=f"gang-{r.gang_affiliation[:20]}",
            type="gang",
            severity="high",
            title="Gang Activity Detected",
            desc=f"Network analysis links {r.cnt} recent FIRs to group '{r.gang_affiliation}' in {district}.",
            district=district,
            time=_time_ago(r.last_seen),
        ))

    return alerts[:limit]


def get_sociological(db: Session) -> SociologicalInsights:
    # ── Suspect gender split ──────────────────────────────────────────────────
    gender_rows = (
        db.query(Suspect.gender, func.count(Suspect.id).label("cnt"))
        .group_by(Suspect.gender).all()
    )
    gender_split = [GenderCount(name=r.gender.capitalize(), value=r.cnt) for r in gender_rows]

    # ── Suspect age groups ────────────────────────────────────────────────────
    buckets = [("15-24", 15, 24), ("25-34", 25, 34), ("35-44", 35, 44), ("45-54", 45, 54), ("55+", 55, 120)]
    age_groups = []
    for label, lo, hi in buckets:
        cnt = db.query(func.count(Suspect.id)).filter(
            Suspect.age_estimated >= lo, Suspect.age_estimated <= hi
        ).scalar() or 0
        age_groups.append(AgeGroupCount(group=label, count=cnt))

    # ── Victim injury types ───────────────────────────────────────────────────
    injury_rows = (
        db.query(Victim.injury_type, func.count(Victim.id).label("cnt"))
        .group_by(Victim.injury_type).all()
    )
    injury_types = [GenderCount(name=r.injury_type.capitalize(), value=r.cnt) for r in injury_rows]

    # ── Recidivism by month (suspects with 2+ FIRs = repeat) ─────────────────
    trend_rows = (
        db.query(
            func.date_format(FIR.incident_date, "%Y-%m").label("month"),
            func.count(FIR.id).label("total"),
        )
        .filter(FIR.incident_date.isnot(None))
        .group_by("month").order_by("month").limit(6).all()
    )
    repeat_suspect_ids = (
        db.query(SuspectFIR.suspect_id)
        .group_by(SuspectFIR.suspect_id)
        .having(func.count(SuspectFIR.fir_id) >= 2)
        .subquery()
    )
    recidivism = []
    for r in trend_rows:
        repeat_cnt = (
            db.query(func.count(func.distinct(SuspectFIR.fir_id)))
            .join(FIR, FIR.id == SuspectFIR.fir_id)
            .filter(
                func.date_format(FIR.incident_date, "%Y-%m") == r.month,
                SuspectFIR.suspect_id.in_(db.query(repeat_suspect_ids)),
            ).scalar() or 0
        )
        recidivism.append(RecidivismPoint(
            month=r.month,
            repeat=repeat_cnt,
            first_time=max(0, r.total - repeat_cnt),
        ))

    # ── Crimes by district ────────────────────────────────────────────────────
    dist_rows = (
        db.query(District.name.label("name"), func.count(FIR.id).label("cnt"))
        .join(FIR, FIR.district_id == District.id)
        .group_by(District.name)
        .order_by(func.count(FIR.id).desc())
        .limit(8).all()
    )
    by_district = [ZoneCount(zone=r.name, crimes=r.cnt) for r in dist_rows]

    # ── Totals ────────────────────────────────────────────────────────────────
    total_suspects  = db.query(func.count(Suspect.id)).scalar() or 0
    total_victims   = db.query(func.count(Victim.id)).scalar() or 0
    known_criminals = db.query(func.count(Suspect.id)).filter(Suspect.is_known_criminal == True).scalar() or 0
    repeat_rate     = round(
        db.query(func.count(func.distinct(SuspectFIR.suspect_id)))
        .group_by(SuspectFIR.suspect_id)
        .having(func.count(SuspectFIR.fir_id) >= 2)
        .count() / max(total_suspects, 1) * 100, 1
    )

    return SociologicalInsights(
        age_groups=age_groups,
        gender_split=gender_split,
        injury_types=injury_types,
        recidivism=recidivism,
        by_district=by_district,
        total_suspects=total_suspects,
        total_victims=total_victims,
        known_criminals=known_criminals,
        repeat_rate=repeat_rate,
    )
