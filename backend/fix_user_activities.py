"""
Fix User Activities Sync - MongoDB to SQLite
"""
import asyncio
import sqlite3
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MONGODB_URL = "mongodb+srv://user3:kUNUn0gVmEWbKsc4@cluster1.o6n4bor.mongodb.net/stockhub?retryWrites=true&w=majority&appName=Cluster1"
DATABASE_NAME = "stockhub"
SQLITE_DB_PATH = "stockhub.db"

async def fix_user_activities_sync():
    # Connect to MongoDB
    mongo_client = AsyncIOMotorClient(MONGODB_URL)
    mongo_db = mongo_client[DATABASE_NAME]
    
    # Connect to SQLite
    sqlite_conn = sqlite3.connect(SQLITE_DB_PATH)
    sqlite_conn.row_factory = sqlite3.Row
    cursor = sqlite_conn.cursor()
    
    try:
        # Create user mapping: MongoDB ObjectId -> SQLite ID
        logger.info("Creating user mapping...")
        
        # Get all users from both databases
        mongo_users = await mongo_db.users.find({}).to_list(length=None)
        cursor.execute("SELECT id, username FROM users")
        sqlite_users = {row[1]: row[0] for row in cursor.fetchall()}
        
        user_id_mapping = {}
        for mongo_user in mongo_users:
            mongo_id = mongo_user["_id"]
            username = mongo_user["username"]
            sqlite_id = sqlite_users.get(username)
            if sqlite_id:
                user_id_mapping[str(mongo_id)] = sqlite_id
        
        logger.info(f"Created mapping for {len(user_id_mapping)} users")
        
        # Clear existing activities
        cursor.execute("DELETE FROM user_activities")
        
        # Get all user activities from MongoDB
        activities = await mongo_db.user_activities.find({}).to_list(length=None)
        logger.info(f"Found {len(activities)} activities in MongoDB")
        
        inserted = 0
        skipped = 0
        
        for activity in activities:
            mongo_user_id = str(activity.get('user_id'))
            sqlite_user_id = user_id_mapping.get(mongo_user_id)
            
            if sqlite_user_id:
                # Convert timestamp
                timestamp = activity.get('timestamp')
                if isinstance(timestamp, datetime):
                    timestamp_str = timestamp.strftime("%Y-%m-%d %H:%M:%S.%f")
                else:
                    timestamp_str = None
                
                # Insert activity
                cursor.execute("""
                    INSERT INTO user_activities 
                    (user_id, action, description, category, ip_address, user_agent, timestamp)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    sqlite_user_id,
                    activity.get('action'),
                    activity.get('description'),
                    activity.get('category'),
                    activity.get('ip_address'),
                    activity.get('user_agent'),
                    timestamp_str
                ))
                inserted += 1
            else:
                skipped += 1
        
        sqlite_conn.commit()
        logger.info(f"✅ User activities sync complete: {inserted} inserted, {skipped} skipped")
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")
        sqlite_conn.rollback()
    finally:
        sqlite_conn.close()
        mongo_client.close()

if __name__ == "__main__":
    asyncio.run(fix_user_activities_sync())
