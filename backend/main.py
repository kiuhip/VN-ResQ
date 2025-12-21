from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import incidents, teams, hotline, assignments
from app.db.session import engine, Base

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="VN-RESQ API", version="0.1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents.router, prefix="/api/incidents", tags=["incidents"])
app.include_router(teams.router, prefix="/api/teams", tags=["teams"])
app.include_router(hotline.router, prefix="/api/hotline", tags=["hotline"])
app.include_router(assignments.router, prefix="/api/assignments", tags=["assignments"])

@app.get("/")
def read_root():

    return {"message": "Welcome to VN-RESQ API - System Operational"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
