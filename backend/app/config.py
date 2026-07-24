import os
from functools import lru_cache
from typing import List
from pydantic import BaseModel

try:
    from pydantic_settings import BaseSettings, SettingsConfigDict

    class Settings(BaseSettings):
        APP_NAME: str = "StockHub API"
        APP_VERSION: str = "1.0.0"
        ENVIRONMENT: str = "development"
        DEBUG: bool = True

        # Security & Authentication
        SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
        REFRESH_SECRET_KEY: str = "your-super-secret-refresh-key-change-this-in-production"
        ALGORITHM: str = "HS256"
        ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
        REFRESH_TOKEN_EXPIRE_DAYS: int = 7

        # Databases
        DATABASE_URL: str = "sqlite:///./stockhub.db"
        DB_ENGINE: str = "sqlite"
        MONGODB_URL: str = "mongodb://localhost:27017"
        MONGODB_DB_NAME: str = "stockhub"

        # CORS
        CORS_ORIGINS: List[str] = [
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:5174",
        ]

        model_config = SettingsConfigDict(
            env_file=".env",
            env_file_encoding="utf-8",
            extra="ignore"
        )

except ImportError:
    class Settings(BaseModel):
        APP_NAME: str = os.getenv("APP_NAME", "StockHub API")
        APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
        ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
        DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

        SECRET_KEY: str = os.getenv("SECRET_KEY", "your-super-secret-key-change-this-in-production")
        REFRESH_SECRET_KEY: str = os.getenv("REFRESH_SECRET_KEY", "your-super-secret-refresh-key-change-this-in-production")
        ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
        ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
        REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

        DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./stockhub.db")
        DB_ENGINE: str = os.getenv("DB_ENGINE", "sqlite")
        MONGODB_URL: str = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        MONGODB_DB_NAME: str = os.getenv("MONGODB_DB_NAME", "stockhub")

        CORS_ORIGINS: List[str] = [
            origin.strip()
            for origin in os.getenv(
                "CORS_ORIGINS",
                "http://localhost:3000,http://localhost:5173,http://localhost:5174"
            ).split(",")
            if origin.strip()
        ]


@lru_cache()
def get_settings() -> Settings:
    """Cached settings singleton for FastAPI Dependency Injection."""
    return Settings()
