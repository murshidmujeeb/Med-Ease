import sys
import os

# Ensure 'backend' directory is in Python path for Vercel serverless execution
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.dirname(CURRENT_DIR)
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.api import endpoints
from app.core.config import settings
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize the database on startup
    from app.db_init import init_db
    init_db()
    yield

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# Widen CORS origins for Vercel preview deployments
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    # Allow all origins for this demo. In production, list specific domains e.g. ["https://medease-app.vercel.app"]
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Pharmacy Automation System API is running"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
