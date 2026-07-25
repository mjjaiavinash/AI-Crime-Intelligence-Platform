from typing import Optional, Literal
from schemas.base import APIBase


class HotspotPoint(APIBase):
    lat: float
    lng: float
    count: int


class TrendPoint(APIBase):
    month: str   # "YYYY-MM"
    total: int


class CrimeTypeCount(APIBase):
    crime_type: str
    total: int


class NetworkNode(APIBase):
    id: str
    label: str
    type: str   # "crime" | "suspect" | "location"


class NetworkEdge(APIBase):
    source: str
    target: str
    label: Optional[str] = None


class NetworkGraph(APIBase):
    nodes: list[NetworkNode]
    edges: list[NetworkEdge]


class AnalyticsSummary(APIBase):
    total_crimes: int
    open_cases: int
    closed_cases: int
    under_investigation: int
    hotspots: list[HotspotPoint]
    trends: list[TrendPoint]
    by_type: list[CrimeTypeCount]


class DistrictStat(APIBase):
    district_id: int
    district_name: str
    total: int
    open_cases: int
    closed_cases: int
    under_investigation: int


class EarlyWarningAlert(APIBase):
    id: str
    type: Literal["repeat", "hotspot", "gang", "pattern"]
    severity: Literal["critical", "high", "medium"]
    title: str
    desc: str
    district: str
    time: str


class AgeGroupCount(APIBase):
    group: str
    count: int


class GenderCount(APIBase):
    name: str
    value: int


class ZoneCount(APIBase):
    zone: str
    crimes: int


class RecidivismPoint(APIBase):
    month: str
    repeat: int
    first_time: int


class SociologicalInsights(APIBase):
    age_groups:   list[AgeGroupCount]
    gender_split: list[GenderCount]
    injury_types: list[GenderCount]
    recidivism:   list[RecidivismPoint]
    by_district:  list[ZoneCount]
    total_suspects: int
    total_victims:  int
    known_criminals: int
    repeat_rate:  float
