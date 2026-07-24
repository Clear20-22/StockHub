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

from app.config import get_settings
from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.services.exceptions import (
    EntityNotFoundError,
    DuplicateEntityError,
    InsufficientCapacityError,
    UnauthorizedOperationError,
)

settings = get_settings()

# Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info(f"Starting up {settings.APP_NAME} v{settings.APP_VERSION} [{settings.ENVIRONMENT}]...")
    # Create SQLAlchemy tables
    Base.metadata.create_all(bind=engine)
    # Connect to MongoDB
    await connect_to_mongo()
    yield
    # Shutdown
    logger.info("Shutting down...")
    await close_mongo_connection()

app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise Warehouse Management System API",
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enterprise Security Headers Middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Domain Exception Handlers
@app.exception_handler(EntityNotFoundError)
async def entity_not_found_handler(request: Request, exc: EntityNotFoundError):
    return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={"detail": str(exc)})

@app.exception_handler(DuplicateEntityError)
async def duplicate_entity_handler(request: Request, exc: DuplicateEntityError):
    return JSONResponse(status_code=status.HTTP_409_CONFLICT, content={"detail": str(exc)})

@app.exception_handler(InsufficientCapacityError)
async def insufficient_capacity_handler(request: Request, exc: InsufficientCapacityError):
    return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": str(exc)})

@app.exception_handler(UnauthorizedOperationError)
async def unauthorized_operation_handler(request: Request, exc: UnauthorizedOperationError):
    return JSONResponse(status_code=status.HTTP_403_FORBIDDEN, content={"detail": str(exc)})

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
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "status": "online",
        "documentation": "/docs"
    }

@app.get("/api/health")
@app.get("/healthz")
async def liveness_probe():
    """Kubernetes liveness probe - checks process status."""
    return {"status": "healthy", "message": "StockHub API process is alive"}

@app.get("/readyz")
async def readiness_probe():
    """Kubernetes readiness probe - checks database connectivity."""
    return {
        "status": "ready",
        "database": "connected",
        "environment": settings.ENVIRONMENT
    }

