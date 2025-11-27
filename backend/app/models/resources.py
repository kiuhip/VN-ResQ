from pydantic import BaseModel
from typing import Optional
from enum import Enum

class ResourceStatus(str, Enum):
    AVAILABLE = "Available"
    BUSY = "Busy"
    OFFLINE = "Offline"

class ResourceType(str, Enum):
    AMBULANCE = "Ambulance"
    FIRE_TRUCK = "Fire Truck"
    POLICE = "Police"
    DRONE = "Drone"
    VOLUNTEER = "Volunteer"

class ResourceBase(BaseModel):
    name: str
    type: ResourceType
    location: str
    lat: float
    lng: float
    status: ResourceStatus = ResourceStatus.AVAILABLE
    contact: Optional[str] = None

class ResourceCreate(ResourceBase):
    pass

class Resource(ResourceBase):
    id: int

    class Config:
        from_attributes = True
