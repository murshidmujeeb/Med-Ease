from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Pharmacy Automation System"
    API_V1_STR: str = "/api"
    
    POSTGRES_SERVER: str = os.getenv("POSTGRES_SERVER", "localhost")
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "postgres")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "password")
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "pharmacy_db")
    # Use DATABASE_URL / POSTGRES_URL if provided (e.g. Supabase, Neon, RDS), otherwise absolute path to pharmacy.db
    SQLALCHEMY_DATABASE_URI: Optional[str] = os.getenv(
        "DATABASE_URL",
        os.getenv(
            "POSTGRES_URL",
            f"sqlite:///{os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../pharmacy.db'))}"
        )
    )
    
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    
    @property
    def database_url(self) -> str:
        url = self.SQLALCHEMY_DATABASE_URI
        if url:
            # Handle postgres:// vs postgresql:// for SQLAlchemy compatibility
            if url.startswith("postgres://"):
                url = url.replace("postgres://", "postgresql://", 1)
            
            # Switch to pure python pg8000 driver for Vercel compatibility
            if url.startswith("postgresql://"):
                url = url.replace("postgresql://", "postgresql+pg8000://", 1)
                
            # Remove pgbouncer=true as Python DB drivers (pg8000/psycopg2) crash on this parameter
            if "pgbouncer=true" in url:
                url = url.replace("pgbouncer=true", "")
                url = url.replace("?&", "?").replace("&&", "&").rstrip("?&")
                
            # Supabase connection pooler requires SSL mode
            if "pg8000" in url and "sslmode=require" not in url:
                if "?" in url:
                    url += "&sslmode=require"
                else:
                    url += "?sslmode=require"
                    
            return url
        return f"postgresql+pg8000://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

    class Config:
        case_sensitive = True
        env_file = [".env", "../.env"]

settings = Settings()
