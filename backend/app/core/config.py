from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "VN-RESQ API"
    DATABASE_URL: str = "sqlite:///./vnresq.db"
    OPENAI_API_KEY: str = "your-openai-api-key" 
    GOOGLE_MAPS_API_KEY: str = "your-google-maps-api-key"
    
    class Config:
        env_file = ".env"

settings = Settings()
