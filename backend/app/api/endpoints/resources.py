from fastapi import APIRouter, HTTPException
from typing import List
from ...models.resources import Resource, ResourceCreate, ResourceStatus, ResourceType

router = APIRouter()

# Mock database
fake_resources_db = [
    {
        "id": 1,
        "name": "Ambulance Unit 01",
        "type": "Ambulance",
        "location": "Cau Giay",
        "lat": 21.033,
        "lng": 105.78,
        "status": "Available",
        "contact": "0987654321"
    },
    {
        "id": 2,
        "name": "Fire Truck 05",
        "type": "Fire Truck",
        "location": "Ba Dinh",
        "lat": 21.036,
        "lng": 105.83,
        "status": "Busy",
        "contact": "0912345678"
    },
    {
        "id": 3,
        "name": "Drone Scout A",
        "type": "Drone",
        "location": "Hoan Kiem",
        "lat": 21.028,
        "lng": 105.85,
        "status": "Available",
        "contact": "N/A"
    }
]

@router.get("/", response_model=List[Resource])
def read_resources():
    return fake_resources_db

@router.post("/", response_model=Resource)
def create_resource(resource: ResourceCreate):
    new_resource = resource.dict()
    new_resource["id"] = len(fake_resources_db) + 1
    fake_resources_db.append(new_resource)
    return new_resource

@router.post("/{resource_id}/status", response_model=Resource)
def update_resource_status(resource_id: int, status: ResourceStatus):
    for resource in fake_resources_db:
        if resource["id"] == resource_id:
            resource["status"] = status
            return resource
    raise HTTPException(status_code=404, detail="Resource not found")
