"""
Simple database migration script
Run this from the backend directory: python -m app.migrate_db
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy import text
from app.database import engine, SessionLocal
from datetime import datetime
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_migrations():
    """Apply database migrations"""
    logger.info("Starting database migration...")
    
    db = SessionLocal()
    try:
        # Add branch_id column to users table if it doesn't exist
        try:
            db.execute(text("ALTER TABLE users ADD COLUMN branch_id INTEGER;"))
            db.commit()
            logger.info("Added branch_id column to users table")
        except Exception as e:
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                logger.info("branch_id column already exists in users table")
            else:
                logger.warning(f"Could not add branch_id column: {e}")
            db.rollback()
        
        # Add last_login column to users table if it doesn't exist
        try:
            db.execute(text("ALTER TABLE users ADD COLUMN last_login TIMESTAMP;"))
            db.commit()
            logger.info("Added last_login column to users table")
        except Exception as e:
            if "duplicate column name" in str(e).lower() or "already exists" in str(e).lower():
                logger.info("last_login column already exists in users table")
            else:
                logger.warning(f"Could not add last_login column: {e}")
            db.rollback()
        
        # Create user_activities table if it doesn't exist
        try:
            db.execute(text("""
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
            db.commit()
            logger.info("Created user_activities table")
        except Exception as e:
            if "already exists" in str(e).lower():
                logger.info("user_activities table already exists")
            else:
                logger.warning(f"Could not create user_activities table: {e}")
            db.rollback()
        
        # Create indexes for better performance
        try:
            db.execute(text("CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);"))
            db.execute(text("CREATE INDEX IF NOT EXISTS idx_user_activities_timestamp ON user_activities(timestamp);"))
            db.commit()
            logger.info("Created indexes on user_activities table")
        except Exception as e:
            logger.warning(f"Could not create indexes: {e}")
            db.rollback()
        
        logger.info("Database migration completed successfully!")
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    run_migrations()
