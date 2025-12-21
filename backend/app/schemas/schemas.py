from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.db.models import IncidentStatus, IncidentPriority, TeamStatus

# Incident Schemas
class IncidentBase(BaseModel):
    description: Optional[str] = None
    location_desc: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    num_people: int = 1
    incident_type: Optional[str] = None
    reporter_name: Optional[str] = None
    reporter_phone: Optional[str] = None

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    status: Optional[IncidentStatus] = None
    priority: Optional[str] = None
    description: Optional[str] = None
    location_desc: Optional[str] = None

class IncidentResponse(IncidentBase):
    id: int
    status: str
    priority: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Rescue Team Schemas
class RescueTeamBase(BaseModel):
    name: str
    phone: str
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None

class RescueTeamCreate(RescueTeamBase):
    pass

class RescueTeamUpdate(BaseModel):
    status: Optional[TeamStatus] = None
    current_lat: Optional[float] = None
    current_lng: Optional[float] = None

class RescueTeamResponse(RescueTeamBase):
    id: int
    status: str
    
    class Config:
        from_attributes = True
