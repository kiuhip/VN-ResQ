from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.schemas import schemas
from pydantic import BaseModel

router = APIRouter()

class AssignmentCreate(BaseModel):
    incident_id: int
    team_id: int

@router.post("/")
def create_assignment(assignment: AssignmentCreate, db: Session = Depends(get_db)):
    # Check if incident and team exist
    incident = db.query(models.Incident).filter(models.Incident.id == assignment.incident_id).first()
    team = db.query(models.RescueTeam).filter(models.RescueTeam.id == assignment.team_id).first()
    
    if not incident or not team:
        raise HTTPException(status_code=404, detail="Incident or Team not found")
    
    # Create Assignment
    db_assignment = models.Assignment(
        incident_id=assignment.incident_id,
        team_id=assignment.team_id
    )
    db.add(db_assignment)
    
    # Update Statuses
    incident.status = models.IncidentStatus.DISPATCHED
    team.status = models.TeamStatus.BUSY
    
    db.commit()
    return {"message": "Team assigned successfully"}
