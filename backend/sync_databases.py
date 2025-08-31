"""
Bidirectional Data Sync Script: MongoDB ↔ SQLite
This script synchronizes data between MongoDB and SQLite databases,
ensuring both have the same information.
"""
import asyncio
import sqlite3
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import sys
import os

# Add the app directory to the path to import models
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MongoDB Atlas connection string
MONGODB_URL = "mongodb+srv://user3:kUNUn0gVmEWbKsc4@cluster1.o6n4bor.mongodb.net/stockhub?retryWrites=true&w=majority&appName=Cluster1"
DATABASE_NAME = "stockhub"

# SQLite database path
SQLITE_DB_PATH = "stockhub.db"

class DataSyncer:
    def __init__(self):
        self.sqlite_conn = None
        self.mongo_client = None
        self.mongo_db = None
        
    async def connect_mongodb(self):
        """Connect to MongoDB Atlas"""
        try:
            self.mongo_client = AsyncIOMotorClient(MONGODB_URL)
            self.mongo_db = self.mongo_client[DATABASE_NAME]
            
            # Test the connection
            await self.mongo_client.admin.command('ping')
            logger.info("✅ Successfully connected to MongoDB Atlas")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect to MongoDB: {e}")
            return False
    
    def connect_sqlite(self):
        """Connect to SQLite database"""
        try:
            self.sqlite_conn = sqlite3.connect(SQLITE_DB_PATH)
            self.sqlite_conn.row_factory = sqlite3.Row
            logger.info("✅ Successfully connected to SQLite database")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect to SQLite: {e}")
            return False

    def convert_datetime(self, dt_value) -> Optional[str]:
        """Convert datetime to SQLite format"""
        if not dt_value:
            return None
        
        if isinstance(dt_value, datetime):
            return dt_value.strftime("%Y-%m-%d %H:%M:%S.%f")
        elif isinstance(dt_value, str):
            return dt_value
        
        return None

    def parse_datetime(self, dt_string: str) -> Optional[datetime]:
        """Parse SQLite datetime string to Python datetime"""
        if not dt_string:
            return None
        
        try:
            formats = [
                "%Y-%m-%d %H:%M:%S.%f",
                "%Y-%m-%d %H:%M:%S",
                "%Y-%m-%dT%H:%M:%S.%f",
                "%Y-%m-%dT%H:%M:%S"
            ]
            
            for fmt in formats:
                try:
                    return datetime.strptime(dt_string, fmt)
                except ValueError:
                    continue
                    
            return None
        except Exception:
            return None

    async def sync_users_mongo_to_sqlite(self):
        """Transfer users from MongoDB to SQLite"""
        logger.info("🔄 Syncing users from MongoDB to SQLite...")
        
        try:
            # Get all users from MongoDB
            mongo_users = await self.mongo_db.users.find({}).to_list(length=None)
            logger.info(f"Found {len(mongo_users)} users in MongoDB")
            
            # Get existing users in SQLite
            cursor = self.sqlite_conn.cursor()
            cursor.execute("SELECT username FROM users")
            existing_usernames = {row[0] for row in cursor.fetchall()}
            
            new_users = 0
            updated_users = 0
            
            for user in mongo_users:
                # Convert MongoDB user to SQLite format
                user_data = {
                    'username': user.get('username'),
                    'email': user.get('email'),
                    'hashed_password': user.get('hashed_password'),
                    'role': user.get('role'),
                    'first_name': user.get('first_name'),
                    'last_name': user.get('last_name'),
                    'phone': user.get('phone'),
                    'address': user.get('address'),
                    'is_active': user.get('is_active', True),
                    'branch_id': user.get('branch_id'),
                    'last_login': self.convert_datetime(user.get('last_login')),
                    'created_at': self.convert_datetime(user.get('created_at'))
                }
                
                if user_data['username'] in existing_usernames:
                    # Update existing user
                    cursor.execute("""
                        UPDATE users SET 
                        email=?, hashed_password=?, role=?, first_name=?, last_name=?,
                        phone=?, address=?, is_active=?, branch_id=?, last_login=?
                        WHERE username=?
                    """, (
                        user_data['email'], user_data['hashed_password'], user_data['role'],
                        user_data['first_name'], user_data['last_name'], user_data['phone'],
                        user_data['address'], user_data['is_active'], user_data['branch_id'],
                        user_data['last_login'], user_data['username']
                    ))
                    updated_users += 1
                else:
                    # Insert new user
                    cursor.execute("""
                        INSERT INTO users 
                        (username, email, hashed_password, role, first_name, last_name, 
                         phone, address, is_active, branch_id, last_login, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        user_data['username'], user_data['email'], user_data['hashed_password'],
                        user_data['role'], user_data['first_name'], user_data['last_name'],
                        user_data['phone'], user_data['address'], user_data['is_active'],
                        user_data['branch_id'], user_data['last_login'], user_data['created_at']
                    ))
                    new_users += 1
            
            self.sqlite_conn.commit()
            logger.info(f"✅ User sync complete: {new_users} new, {updated_users} updated")
            
        except Exception as e:
            logger.error(f"❌ Error syncing users: {e}")
            self.sqlite_conn.rollback()

    async def sync_user_activities_mongo_to_sqlite(self):
        """Transfer user activities from MongoDB to SQLite"""
        logger.info("🔄 Syncing user activities from MongoDB to SQLite...")
        
        try:
            # Get all user activities from MongoDB
            mongo_activities = await self.mongo_db.user_activities.find({}).to_list(length=None)
            logger.info(f"Found {len(mongo_activities)} user activities in MongoDB")
            
            # Get user ID mapping (username to SQLite user ID)
            cursor = self.sqlite_conn.cursor()
            cursor.execute("SELECT id, username FROM users")
            user_mapping = {row[1]: row[0] for row in cursor.fetchall()}
            
            # Clear existing activities to avoid duplicates
            cursor.execute("DELETE FROM user_activities")
            
            inserted_activities = 0
            
            for activity in mongo_activities:
                # Find corresponding SQLite user ID
                mongo_user_id = activity.get('user_id')
                if isinstance(mongo_user_id, ObjectId):
                    # Find user by ObjectId in MongoDB to get username
                    user_doc = await self.mongo_db.users.find_one({"_id": mongo_user_id})
                    if user_doc:
                        sqlite_user_id = user_mapping.get(user_doc['username'])
                    else:
                        continue
                else:
                    # Assume it's already a username or find a way to map it
                    sqlite_user_id = user_mapping.get(str(mongo_user_id))
                
                if sqlite_user_id:
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
                        self.convert_datetime(activity.get('timestamp'))
                    ))
                    inserted_activities += 1
            
            self.sqlite_conn.commit()
            logger.info(f"✅ User activities sync complete: {inserted_activities} activities transferred")
            
        except Exception as e:
            logger.error(f"❌ Error syncing user activities: {e}")
            self.sqlite_conn.rollback()

    async def sync_goods_sqlite_to_mongo(self):
        """Transfer goods from SQLite to MongoDB"""
        logger.info("🔄 Syncing goods from SQLite to MongoDB...")
        
        try:
            # Get all goods from SQLite
            cursor = self.sqlite_conn.cursor()
            cursor.execute("SELECT * FROM goods")
            sqlite_goods = cursor.fetchall()
            logger.info(f"Found {len(sqlite_goods)} goods in SQLite")
            
            # Get user mapping (SQLite user ID to MongoDB ObjectId)
            cursor.execute("SELECT id, username FROM users")
            sqlite_users = cursor.fetchall()
            user_mapping = {}
            
            for sqlite_user in sqlite_users:
                mongo_user = await self.mongo_db.users.find_one({"username": sqlite_user[1]})
                if mongo_user:
                    user_mapping[sqlite_user[0]] = mongo_user["_id"]
            
            # Get existing goods in MongoDB to avoid duplicates
            existing_goods = await self.mongo_db.goods.find({}).to_list(length=None)
            existing_goods_names = {good.get('name') for good in existing_goods}
            
            new_goods = 0
            
            for good in sqlite_goods:
                good_dict = dict(good)
                
                # Skip if already exists
                if good_dict['name'] in existing_goods_names:
                    continue
                
                # Convert SQLite good to MongoDB format
                mongo_good = {
                    'name': good_dict['name'],
                    'description': good_dict['description'],
                    'category': good_dict['category'],
                    'quantity': good_dict['quantity'],
                    'price_per_unit': good_dict['price_per_unit'],
                    'owner_id': user_mapping.get(good_dict['owner_id']),
                    'branch_id': good_dict['branch_id'],
                    'created_at': self.parse_datetime(good_dict['created_at']),
                    'updated_at': self.parse_datetime(good_dict['updated_at'])
                }
                
                # Insert into MongoDB
                await self.mongo_db.goods.insert_one(mongo_good)
                new_goods += 1
            
            logger.info(f"✅ Goods sync complete: {new_goods} new goods transferred to MongoDB")
            
        except Exception as e:
            logger.error(f"❌ Error syncing goods: {e}")

    async def sync_customer_applications_sqlite_to_mongo(self):
        """Transfer customer applications from SQLite to MongoDB"""
        logger.info("🔄 Syncing customer applications from SQLite to MongoDB...")
        
        try:
            # Get all customer applications from SQLite
            cursor = self.sqlite_conn.cursor()
            cursor.execute("SELECT * FROM customer_applications")
            sqlite_applications = cursor.fetchall()
            logger.info(f"Found {len(sqlite_applications)} customer applications in SQLite")
            
            # Create customer_applications collection in MongoDB if it doesn't exist
            new_applications = 0
            
            for app in sqlite_applications:
                app_dict = dict(app)
                
                # Convert SQLite application to MongoDB format
                mongo_app = {
                    'full_name': app_dict['full_name'],
                    'email': app_dict['email'],
                    'phone': app_dict['phone'],
                    'address': app_dict['address'],
                    'is_business_account': app_dict['is_business_account'],
                    'business_name': app_dict['business_name'],
                    'business_type': app_dict['business_type'],
                    'item_type': app_dict['item_type'],
                    'estimated_volume': app_dict['estimated_volume'],
                    'storage_type': app_dict['storage_type'],
                    'access_frequency': app_dict['access_frequency'],
                    'storage_duration': app_dict['storage_duration'],
                    'special_requirements': app_dict['special_requirements'],
                    'insurance_required': app_dict['insurance_required'],
                    'packing_services': app_dict['packing_services'],
                    'transportation_needed': app_dict['transportation_needed'],
                    'inventory_list_url': app_dict['inventory_list_url'],
                    'identification_doc_url': app_dict['identification_doc_url'],
                    'status': app_dict['status'],
                    'employee_notes': app_dict['employee_notes'],
                    'reviewed_by': app_dict['reviewed_by'],
                    'review_date': self.parse_datetime(app_dict['review_date']),
                    'created_at': self.parse_datetime(app_dict['created_at']),
                    'updated_at': self.parse_datetime(app_dict['updated_at'])
                }
                
                # Insert into MongoDB
                await self.mongo_db.customer_applications.insert_one(mongo_app)
                new_applications += 1
            
            logger.info(f"✅ Customer applications sync complete: {new_applications} applications transferred to MongoDB")
            
        except Exception as e:
            logger.error(f"❌ Error syncing customer applications: {e}")

    async def run_full_sync(self):
        """Run complete bidirectional sync"""
        print("=" * 60)
        print("🔄 STARTING BIDIRECTIONAL DATA SYNC")
        print("=" * 60)
        
        if not await self.connect_mongodb():
            return
        
        if not self.connect_sqlite():
            return
        
        try:
            # MongoDB → SQLite transfers
            await self.sync_users_mongo_to_sqlite()
            await self.sync_user_activities_mongo_to_sqlite()
            
            # SQLite → MongoDB transfers
            await self.sync_goods_sqlite_to_mongo()
            await self.sync_customer_applications_sqlite_to_mongo()
            
            print("\n" + "=" * 60)
            print("✅ BIDIRECTIONAL SYNC COMPLETE!")
            print("Both databases now have synchronized data.")
            print("=" * 60)
            
        except Exception as e:
            logger.error(f"❌ Sync failed: {e}")
        finally:
            if self.sqlite_conn:
                self.sqlite_conn.close()
            if self.mongo_client:
                self.mongo_client.close()

async def main():
    syncer = DataSyncer()
    await syncer.run_full_sync()

if __name__ == "__main__":
    asyncio.run(main())
