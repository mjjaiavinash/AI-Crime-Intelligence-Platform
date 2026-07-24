from typing import List, Optional
from pydantic import BaseModel, Field


# ── Hotspot Prediction ────────────────────────────────────────────────────────

class HotspotPredictRequest(BaseModel):
    District: str                   = Field(..., example="Bengaluru Urban")
    Taluk: str                      = Field(..., example="Bengaluru North")
    Police_Station: str             = Field(..., example="Hebbal")
    Crime_Type: str                 = Field(..., example="Theft")
    Year: int                       = Field(..., example=2024)
    Month: int                      = Field(..., ge=1, le=12, example=6)
    Season: str                     = Field(..., example="Summer")
    Latitude: float                 = Field(..., example=13.0358)
    Longitude: float                = Field(..., example=77.5970)
    Population: int                 = Field(..., example=500000)
    Population_Density: int         = Field(..., example=12000)
    Literacy_Rate: float            = Field(..., example=88.5)
    Unemployment_Rate: float        = Field(..., example=4.2)
    Festival_Season: str            = Field(..., example="No")
    Crime_Count_Last30Days: int     = Field(..., example=45)
    Previous_Year_Crime_Count: int  = Field(..., example=520)


class HotspotPredictResponse(BaseModel):
    prediction:   str        = Field(..., example="High")
    confidence:   float      = Field(..., example=96.4)
    top_features: List[str]  = Field(..., example=["Crime_Count_Last30Days", "Population_Density"])


# ── Repeat Offender Prediction ────────────────────────────────────────────────

class RepeatOffenderRequest(BaseModel):
    Age: int                    = Field(..., ge=10, le=100, example=28)
    Gender: str                 = Field(..., example="Male")
    District: str               = Field(..., example="Bengaluru Urban")
    Primary_Crime_Type: str     = Field(..., example="Theft")
    Previous_Arrests: int       = Field(..., ge=0, example=5)
    Previous_Convictions: int   = Field(..., ge=0, example=3)
    Years_Active: int           = Field(..., ge=0, example=4)
    Bail_Count: int             = Field(..., ge=0, example=2)
    Known_Associates: int       = Field(..., ge=0, example=8)
    Gang_Affiliation: str       = Field(..., example="Yes")


class RepeatOffenderResponse(BaseModel):
    prediction:   str        = Field(..., example="Yes")
    confidence:   float      = Field(..., example=95.8)
    risk_level:   str        = Field(..., example="High")
    top_features: List[str]  = Field(..., example=["Previous_Arrests", "Known_Associates"])


# ── Crime Classification ───────────────────────────────────────────────────────

class CrimeClassifyRequest(BaseModel):
    Description:   str            = Field(..., example="Vehicle stolen from parking lot near market")
    District:      str            = Field(..., example="Bengaluru Urban")
    Location_Type: str            = Field(..., example="Market")
    Time_of_Day:   str            = Field(..., example="Night")
    Victim_Age:    int            = Field(..., ge=0, le=120, example=35)
    Victim_Gender: str            = Field(..., example="Male")
    Weapon_Used:   Optional[str]  = Field(None, example="None")
    Incident_Date: Optional[str]  = Field(None, example="2024-03-15")


class CrimeClassifyResponse(BaseModel):
    prediction:   str        = Field(..., example="Vehicle Theft")
    confidence:   float      = Field(..., example=97.1)
    top_features: List[str]  = Field(..., example=["Description", "Weapon_Used", "Location_Type"])
