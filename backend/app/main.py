from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base
from routers import auth, users, goods, branches, assignments

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StockHub API",
    description="Warehouse Management System API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(goods.router, prefix="/api/goods", tags=["Goods"])
app.include_router(branches.router, prefix="/api/branches", tags=["Branches"])
app.include_router(assignments.router, prefix="/api/assignments", tags=["Assignments"])

@app.get("/")
async def root():
    return {"message": "Welcome to StockHub API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "StockHub API is running"}
