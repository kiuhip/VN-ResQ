from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from ...models.alert import Alert, AlertCreate

router = APIRouter()

# Mock database
fake_alerts_db = [
    {
        "id": 1,
        "type": "SOS Voice",
        "location": "Cau Giay, Hanoi",
        "status": "Critical",
        "description": "Panic detected. Keywords: \"Flood\", \"Trapped\".",
        "lat": 21.033,
        "lng": 105.78,
        "timestamp": datetime.now()
    },
    {
        "id": 2,
        "type": "Vision AI",
        "location": "Ba Dinh, Hanoi",
        "status": "High",
        "description": "Person detected on rooftop. Confidence: 92%.",
        "lat": 21.036,
        "lng": 105.83,
        "timestamp": datetime.now()
    },
    {
        "id": 3,
        "type": "Social",
        "location": "Hoan Kiem, Hanoi",
        "status": "Medium",
        "description": "Twitter report: \"Water rising fast at...\"",
        "lat": 21.028,
        "lng": 105.85,
        "timestamp": datetime.now()
    }
]

@router.get("/", response_model=List[Alert])
def read_alerts():
    return fake_alerts_db

@router.post("/", response_model=Alert)
def create_alert(alert: AlertCreate):
    new_alert = alert.dict()
    new_alert["id"] = len(fake_alerts_db) + 1
    new_alert["timestamp"] = datetime.now()
    fake_alerts_db.append(new_alert)
    return new_alert
