"""
MongoDB configuration and database connection using Motor async driver
"""
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import logging

from app.config import get_settings

logger = logging.getLogger(__name__)

class MongoDB:
    def __init__(self):
        self.client = None
        self.database = None

mongodb = MongoDB()

# MongoDB connection settings are loaded from the environment / backend/.env
settings = get_settings()
MONGODB_URL = settings.MONGODB_URL
DATABASE_NAME = settings.MONGODB_DB_NAME

async def connect_to_mongo():
    """Create database connection"""
    try:
        mongodb.client = AsyncIOMotorClient(MONGODB_URL)
        mongodb.database = mongodb.client[DATABASE_NAME]
        
        # Test the connection
        await mongodb.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB Atlas")
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    """Close database connection"""
    if mongodb.client:
        mongodb.client.close()
        logger.info("MongoDB connection closed")

def get_database():
    """Get database instance"""
    return mongodb.database
