"""
Database Maintenance Script
Use this script for ongoing synchronization between MongoDB and SQLite
"""
import asyncio
import sqlite3
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MONGODB_URL = "mongodb+srv://user3:kUNUn0gVmEWbKsc4@cluster1.o6n4bor.mongodb.net/stockhub?retryWrites=true&w=majority&appName=Cluster1"
DATABASE_NAME = "stockhub"
SQLITE_DB_PATH = "stockhub.db"

async def sync_recent_activities(hours_back=24):
    """Sync recent user activities from MongoDB to SQLite"""
    mongo_client = AsyncIOMotorClient(MONGODB_URL)
    mongo_db = mongo_client[DATABASE_NAME]
    
    sqlite_conn = sqlite3.connect(SQLITE_DB_PATH)
    cursor = sqlite_conn.cursor()
    
    try:
        # Get cutoff time
        cutoff_time = datetime.utcnow() - timedelta(hours=hours_back)
        
        # Get user mapping
        mongo_users = await mongo_db.users.find({}).to_list(length=None)
        cursor.execute("SELECT id, username FROM users")
        sqlite_users = {row[1]: row[0] for row in cursor.fetchall()}
        
        user_id_mapping = {}
        for mongo_user in mongo_users:
            username = mongo_user["username"]
            sqlite_id = sqlite_users.get(username)
            if sqlite_id:
                user_id_mapping[str(mongo_user["_id"])] = sqlite_id
        
        # Get recent activities
        recent_activities = await mongo_db.user_activities.find({
            "timestamp": {"$gte": cutoff_time}
        }).to_list(length=None)
        
        # Delete existing recent activities
        cutoff_str = cutoff_time.strftime("%Y-%m-%d %H:%M:%S")
        cursor.execute("DELETE FROM user_activities WHERE timestamp >= ?", (cutoff_str,))
        
        # Insert new activities
        inserted = 0
        for activity in recent_activities:
            mongo_user_id = str(activity.get('user_id'))
            sqlite_user_id = user_id_mapping.get(mongo_user_id)
            
            if sqlite_user_id:
                timestamp = activity.get('timestamp')
                if isinstance(timestamp, datetime):
                    timestamp_str = timestamp.strftime("%Y-%m-%d %H:%M:%S.%f")
                else:
                    timestamp_str = None
                
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
        
        sqlite_conn.commit()
        logger.info(f"✅ Synced {inserted} recent activities (last {hours_back} hours)")
        
    except Exception as e:
        logger.error(f"❌ Error syncing activities: {e}")
        sqlite_conn.rollback()
    finally:
        sqlite_conn.close()
        mongo_client.close()

async def backup_customer_applications():
    """Backup customer applications from SQLite to MongoDB"""
    mongo_client = AsyncIOMotorClient(MONGODB_URL)
    mongo_db = mongo_client[DATABASE_NAME]
    
    sqlite_conn = sqlite3.connect(SQLITE_DB_PATH)
    sqlite_conn.row_factory = sqlite3.Row
    cursor = sqlite_conn.cursor()
    
    try:
        # Get recent customer applications
        cutoff_time = datetime.utcnow() - timedelta(days=1)
        cutoff_str = cutoff_time.strftime("%Y-%m-%d %H:%M:%S")
        
        cursor.execute("SELECT * FROM customer_applications WHERE updated_at >= ?", (cutoff_str,))
        recent_apps = cursor.fetchall()
        
        if recent_apps:
            # Remove existing recent applications
            await mongo_db.customer_applications.delete_many({
                "updated_at": {"$gte": cutoff_time}
            })
            
            # Insert updated applications
            for app in recent_apps:
                app_dict = dict(app)
                
                # Convert datetime fields
                for field in ['review_date', 'created_at', 'updated_at']:
                    if app_dict.get(field):
                        try:
                            app_dict[field] = datetime.strptime(
                                app_dict[field], "%Y-%m-%d %H:%M:%S.%f"
                            )
                        except (ValueError, TypeError):
                            app_dict[field] = None
                
                # Remove SQLite-specific ID field
                app_dict.pop('id', None)
                
                await mongo_db.customer_applications.insert_one(app_dict)
            
            logger.info(f"✅ Backed up {len(recent_apps)} recent customer applications")
        else:
            logger.info("No recent customer applications to backup")
            
    except Exception as e:
        logger.error(f"❌ Error backing up applications: {e}")
    finally:
        sqlite_conn.close()
        mongo_client.close()

async def main():
    print("🔧 Database Maintenance")
    print("Syncing recent changes...")
    
    await sync_recent_activities(hours_back=24)
    await backup_customer_applications()
    
    print("✅ Maintenance complete!")

if __name__ == "__main__":
    asyncio.run(main())
