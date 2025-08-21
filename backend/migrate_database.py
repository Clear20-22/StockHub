"""
Database migration script to add new fields to User table and create UserActivity table
Run this script once to update your existing database schema
"""

import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from sqlalchemy import create_engine, text, Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from app.database import Base, engine, SessionLocal
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_database():
    """
    Apply database migrations
    """
    logger.info("Starting database migration...")
    
    with engine.connect() as connection:
        # Start a transaction
        trans = connection.begin()
        
        try:
            # Add branch_id column to users table if it doesn't exist
            try:
                connection.execute(text("ALTER TABLE users ADD COLUMN branch_id INTEGER;"))
                logger.info("Added branch_id column to users table")
            except Exception as e:
                if "already exists" in str(e) or "duplicate column name" in str(e).lower():
                    logger.info("branch_id column already exists in users table")
                else:
                    logger.warning(f"Could not add branch_id column: {e}")
            
            # Add last_login column to users table if it doesn't exist
            try:
                connection.execute(text("ALTER TABLE users ADD COLUMN last_login TIMESTAMP;"))
                logger.info("Added last_login column to users table")
            except Exception as e:
                if "already exists" in str(e) or "duplicate column name" in str(e).lower():
                    logger.info("last_login column already exists in users table")
                else:
                    logger.warning(f"Could not add last_login column: {e}")
            
            # Create user_activities table if it doesn't exist
            try:
                connection.execute(text("""
                    CREATE TABLE user_activities (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        user_id INTEGER NOT NULL,
                        action VARCHAR NOT NULL,
                        description TEXT,
                        category VARCHAR,
                        ip_address VARCHAR,
                        user_agent VARCHAR,
                        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (user_id) REFERENCES users(id)
                    );
                """))
                logger.info("Created user_activities table")
            except Exception as e:
                if "already exists" in str(e):
                    logger.info("user_activities table already exists")
                else:
                    logger.warning(f"Could not create user_activities table: {e}")
            
            # Create index on user_activities for better performance
            try:
                connection.execute(text("CREATE INDEX idx_user_activities_user_id ON user_activities(user_id);"))
                connection.execute(text("CREATE INDEX idx_user_activities_timestamp ON user_activities(timestamp);"))
                logger.info("Created indexes on user_activities table")
            except Exception as e:
                if "already exists" in str(e):
                    logger.info("Indexes already exist on user_activities table")
                else:
                    logger.warning(f"Could not create indexes: {e}")
            
            # Commit the transaction
            trans.commit()
            logger.info("Database migration completed successfully!")
            
        except Exception as e:
            # Rollback on error
            trans.rollback()
            logger.error(f"Migration failed: {e}")
            raise

def create_all_tables():
    """
    Create all tables using SQLAlchemy models
    This will create new tables but won't modify existing ones
    """
    logger.info("Creating all tables from models...")
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("All tables created successfully!")
    except Exception as e:
        logger.error(f"Error creating tables: {e}")

def seed_sample_activities():
    """
    Add some sample user activities for testing
    """
    logger.info("Seeding sample user activities...")
    
    db = SessionLocal()
    try:
        # Check if we have any users first
        result = db.execute(text("SELECT id, username FROM users LIMIT 5;"))
        users = result.fetchall()
        
        if not users:
            logger.info("No users found, skipping activity seeding")
            return
        
        # Add sample activities for existing users
        sample_activities = [
            ("Login", "User logged into the system", "auth"),
            ("Profile Update", "Updated profile information", "profile"),
            ("Password Changed", "Password was successfully changed", "security"),
            ("Goods Access", "Accessed goods management", "goods"),
        ]
        
        for user_id, username in users:
            for action, description, category in sample_activities:
                db.execute(text("""
                    INSERT OR IGNORE INTO user_activities 
                    (user_id, action, description, category, ip_address, user_agent, timestamp) 
                    VALUES (:user_id, :action, :description, :category, '127.0.0.1', 'Migration Script', :timestamp)
                """), {
                    "user_id": user_id,
                    "action": action,
                    "description": f"{description} - {username}",
                    "category": category,
                    "timestamp": datetime.utcnow()
                })
        
        db.commit()
        logger.info("Sample activities added successfully!")
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding activities: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    try:
        # Run migrations
        migrate_database()
        
        # Create any new tables
        create_all_tables()
        
        # Add sample data
        seed_sample_activities()
        
        logger.info("All migration tasks completed!")
        
    except Exception as e:
        logger.error(f"Migration script failed: {e}")
        exit(1)
