from typing import Optional
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
