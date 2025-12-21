from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.db.session import Base

class IncidentStatus(str, enum.Enum):
    RECEIVED = "received"
    PROCESSING = "processing"
    DISPATCHED = "dispatched"
    VERIFIED = "verified"
    INVALID = "invalid"
    DONE = "done"

class IncidentPriority(str, enum.Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class TeamStatus(str, enum.Enum):
    AVAILABLE = "available"
    BUSY = "busy"
    OFFLINE = "offline"

class Incident(Base):
    __tablename__ = "incidents"
    
    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, nullable=True)
    location_desc = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)
    num_people = Column(Integer, default=1)
    incident_type = Column(String, nullable=True) # e.g. "Flood", "Medical"
    priority = Column(String, default=IncidentPriority.MEDIUM) # Store as string for flexibility or use Enum
    status = Column(String, default=IncidentStatus.RECEIVED)
    
    reporter_name = Column(String, nullable=True)
    reporter_phone = Column(String, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    assignments = relationship("Assignment", back_populates="incident")
    
class RescueTeam(Base):
    __tablename__ = "rescue_teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    phone = Column(String)
    current_lat = Column(Float, nullable=True)
    current_lng = Column(Float, nullable=True)
    status = Column(String, default=TeamStatus.AVAILABLE)
    
    assignments = relationship("Assignment", back_populates="team")

class Assignment(Base):
    __tablename__ = "assignments"
    
    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"))
    team_id = Column(Integer, ForeignKey("rescue_teams.id"))
    assigned_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="active") # active, completed
    
    incident = relationship("Incident", back_populates="assignments")
    team = relationship("RescueTeam", back_populates="assignments")

class HotlineCall(Base):
    __tablename__ = "hotline_calls"
    id = Column(Integer, primary_key=True, index=True)
    audio_url = Column(String)
    transcription = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

class FacebookMessage(Base):
    __tablename__ = "facebook_messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(String)
    content = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
