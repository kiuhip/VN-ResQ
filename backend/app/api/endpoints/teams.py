from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.db import models
from app.schemas import schemas

router = APIRouter()

@router.post("/", response_model=schemas.RescueTeamResponse)
def create_team(team: schemas.RescueTeamCreate, db: Session = Depends(get_db)):
    db_team = models.RescueTeam(
        name=team.name,
        phone=team.phone,
        current_lat=team.current_lat,
        current_lng=team.current_lng
    )
    db.add(db_team)
    db.commit()
    db.refresh(db_team)
    return db_team

@router.get("/", response_model=List[schemas.RescueTeamResponse])
def read_teams(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    teams = db.query(models.RescueTeam).offset(skip).limit(limit).all()
    return teams

@router.patch("/{team_id}", response_model=schemas.RescueTeamResponse)
def update_team(team_id: int, team_update: schemas.RescueTeamUpdate, db: Session = Depends(get_db)):
    db_team = db.query(models.RescueTeam).filter(models.RescueTeam.id == team_id).first()
    if not db_team:
        raise HTTPException(status_code=404, detail="Team not found")
        
    update_data = team_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_team, key, value)
        
    db.commit()
    db.refresh(db_team)
    return db_team
