from fastapi import APIRouter, UploadFile, File, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db import models
from app.services.ai_service import ai_service
import shutil
import os
import uuid

router = APIRouter()

def process_audio_background(call_id: int, file_path: str, db: Session):
    # 1. Transcribe
    text = ai_service.transcribe_audio(file_path)
    
    # 2. Update Call Record
    # Note: re-acquiring session might be safer in real app, but for simplicity:
    call = db.query(models.HotlineCall).filter(models.HotlineCall.id == call_id).first()
    if call:
        call.transcription = text
        db.commit()
        
    # 3. Extract Info & Create Incident
    info = ai_service.extract_incident_info(text)
    if info:
        incident = models.Incident(
            description=info.get("description", text),
            location_desc=info.get("location_desc"),
            num_people=info.get("num_people", 1),
            incident_type=info.get("incident_type"),
            priority=info.get("priority", "medium"),
            status=models.IncidentStatus.RECEIVED,
            reporter_name="Hotline Caller"
        )
        db.add(incident)
        db.commit()

@router.post("/upload")
def upload_audio(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...), 
    db: Session = Depends(get_db)
):
    # Save file
    safe_filename = f"{uuid.uuid4()}_{file.filename}"
    file_location = f"temp_audio_{safe_filename}"
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
    
    # Create DB entry
    db_call = models.HotlineCall(audio_url=file_location)
    db.add(db_call)
    db.commit()
    db.refresh(db_call)
    
    # Trigger background processing
    # Note: Passing db session to background task can be tricky with connection pooling.
    # ideally we create a new session in the task. For this MVP we will try to run synchronously 
    # or just assume the session persists (which it won't correctly in FastAPI background tasks often).
    # Correct way: pass ID and path, create new session in task.
    # For MVP: I'll just run it synchronously here to ensure it works for the demo.
    
    process_audio_background(db_call.id, file_location, db)
    
    return {"message": "Audio received and processing", "call_id": db_call.id}
