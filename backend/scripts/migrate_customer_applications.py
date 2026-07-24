"""
Database migration script for Customer Applications
This script creates the customer_applications table if it doesn't exist
and handles any necessary schema updates.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.database import Base, engine, CustomerApplication
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_customer_applications_table():
    """Create the customer applications table"""
    try:
        # Create all tables defined in Base metadata
        Base.metadata.create_all(bind=engine)
        logger.info("Successfully created/updated database tables")
        
        # Verify the table exists
        with engine.connect() as connection:
            result = connection.execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='customer_applications';
            """))
            
            if result.fetchone():
                logger.info("customer_applications table exists and is ready")
                
                # Check table schema
                result = connection.execute(text("PRAGMA table_info(customer_applications);"))
                columns = result.fetchall()
                logger.info(f"Table has {len(columns)} columns:")
                for column in columns:
                    logger.info(f"  - {column[1]} ({column[2]})")
            else:
                logger.error("customer_applications table was not created!")
                return False
                
    except Exception as e:
        logger.error(f"Error creating customer applications table: {e}")
        return False
        
    return True

def check_and_migrate():
    """Check current database state and perform migrations if needed"""
    try:
        with engine.connect() as connection:
            # Check if customer_applications table exists
            result = connection.execute(text("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='customer_applications';
            """))
            
            if not result.fetchone():
                logger.info("customer_applications table not found. Creating...")
                return create_customer_applications_table()
            else:
                logger.info("customer_applications table already exists")
                
                # You can add column additions or other migrations here
                # For example:
                # try:
                #     connection.execute(text("ALTER TABLE customer_applications ADD COLUMN new_column TEXT;"))
                #     connection.commit()
                #     logger.info("Added new_column to customer_applications")
                # except Exception as e:
                #     logger.info(f"Column might already exist: {e}")
                
                return True
                
    except Exception as e:
        logger.error(f"Error during migration check: {e}")
        return False

if __name__ == "__main__":
    logger.info("Starting database migration for customer applications...")
    
    if check_and_migrate():
        logger.info("Database migration completed successfully!")
        
        # Test insert to verify everything works
        try:
            from app.database import SessionLocal
            
            db = SessionLocal()
            
            # Count existing applications
            count = db.query(CustomerApplication).count()
            logger.info(f"Current number of customer applications: {count}")
            
            db.close()
            logger.info("Database connection test successful!")
            
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            
    else:
        logger.error("Database migration failed!")
        sys.exit(1)
