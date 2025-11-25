from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AlertBase(BaseModel):
    type: str  # "SOS Voice", "Vision AI", "Social"
    location: str
    status: str  # "Critical", "High", "Medium", "Low"
    description: str
    lat: float
    lng: float

class AlertCreate(AlertBase):
    pass

class Alert(AlertBase):
    id: int
    timestamp: datetime

    class Config:
        from_attributes = True
