from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db import models
from app.schemas import schemas
from app.services.ai_service import ai_service

router = APIRouter()

@router.post("/", response_model=schemas.IncidentResponse)
def create_incident(
    incident: schemas.IncidentCreate, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # If using AI extraction, we might just take raw text and process it.
    # For now, strict schema creation.
    # We can run priority scoring in background
    
    db_incident = models.Incident(
        description=incident.description,
        location_desc=incident.location_desc,
        lat=incident.lat,
        lng=incident.lng,
        num_people=incident.num_people,
        incident_type=incident.incident_type,
        reporter_name=incident.reporter_name,
        reporter_phone=incident.reporter_phone,
        status=models.IncidentStatus.RECEIVED
    )
    
    # Simple rule based priority
    if incident.num_people > 5:
        db_incident.priority = models.IncidentPriority.CRITICAL
    elif incident.num_people > 2:
        db_incident.priority = models.IncidentPriority.HIGH
    else:
        db_incident.priority = models.IncidentPriority.MEDIUM

    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)
    return db_incident

@router.get("/", response_model=List[schemas.IncidentResponse])
def read_incidents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    incidents = db.query(models.Incident).offset(skip).limit(limit).all()
    return incidents

@router.get("/{incident_id}", response_model=schemas.IncidentResponse)
def read_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

@router.patch("/{incident_id}", response_model=schemas.IncidentResponse)
def update_incident(incident_id: int, incident_update: schemas.IncidentUpdate, db: Session = Depends(get_db)):
    db_incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not db_incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    update_data = incident_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_incident, key, value)
    
    db.commit()
    db.refresh(db_incident)
    return db_incident
