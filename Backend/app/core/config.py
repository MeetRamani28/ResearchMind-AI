import os
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import Optional, Union

class Settings(BaseSettings):
    # App General Config
    APP_NAME: str = "ResearchMind-AI API"
    ENV_MODE: str = "development" # "development" or "production"
    APP_DEBUG: bool = True
    FRONTEND_URL: str = "http://localhost:5173"

    # Database Settings
    DEV_DATABASE_URL: str = "sqlite+aiosqlite:///./researchmind_dev.db"
    PROD_DATABASE_URL: Optional[str] = None
    
    @property
    def DATABASE_URL(self) -> str:
        if self.ENV_MODE == "production" and self.PROD_DATABASE_URL:
            return self.PROD_DATABASE_URL
        return self.DEV_DATABASE_URL

    # AI API Keys
    COHERE_API_KEY: Optional[str] = None
    TAVILY_API_KEY: Optional[str] = None

    # Clerk Authentication
    CLERK_SECRET_KEY: Optional[str] = None
    CLERK_PUBLISHABLE_KEY: Optional[str] = None
    CLERK_JWKS_URL: Optional[str] = None

    # Vector Database Settings
    PINECONE_API_KEY: Optional[str] = None
    PINECONE_INDEX_NAME: str = "researchmind-index"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
