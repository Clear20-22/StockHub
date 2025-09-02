from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys
import os
from contextlib import asynccontextmanager

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base
from app.mongodb import connect_to_mongo, close_mongo_connection
from app.routers import auth, users, goods, branches, assignments, items, customer_applications
from app.routers import mongo_users, mongo_goods, mongo_auth

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up...")
    # Create SQLAlchemy tables (keeping existing functionality)
    Base.metadata.create_all(bind=engine)
    # Connect to MongoDB
    await connect_to_mongo()
    yield
    # Shutdown
    logger.info("Shutting down...")
    await close_mongo_connection()

app = FastAPI(
    title="StockHub API",
    description="Warehouse Management System API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication (SQLite)"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(goods.router, prefix="/api/goods", tags=["Goods"])
app.include_router(branches.router, prefix="/api/branches", tags=["Branches"])
app.include_router(assignments.router, prefix="/api/assignments", tags=["Assignments"])
app.include_router(items.router, prefix="/api/items", tags=["Items"])
app.include_router(customer_applications.router, prefix="/api/applications", tags=["Customer Applications"])

# MongoDB routers (new collections)
app.include_router(mongo_auth.router, prefix="/api/mongo/auth", tags=["MongoDB Authentication"])
app.include_router(mongo_users.router, prefix="/api/mongo/users", tags=["MongoDB Users"])
app.include_router(mongo_goods.router, prefix="/api/mongo/goods", tags=["MongoDB Goods"])

@app.get("/")
async def root():
    return {"message": "Welcome to StockHub API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "StockHub API is running"}
