from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import alerts

app = FastAPI(title="VN-RESQ API", version="0.1.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(alerts.router, prefix="/api/alerts", tags=["alerts"])

@app.get("/")
def read_root():
    return {"message": "Welcome to VN-RESQ API"}

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
