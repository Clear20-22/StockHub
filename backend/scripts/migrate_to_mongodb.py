"""
Data Migration Script: SQLite to MongoDB Atlas
This script migrates all existing data from the SQLite database to MongoDB Atlas.
"""
import asyncio
import sqlite3
from datetime import datetime
from typing import Dict, List, Any, Optional
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

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

class DataMigrator:
    def __init__(self):
        self.sqlite_conn = None
        self.mongo_client = None
        self.mongo_db = None
        self.id_mapping = {}  # Maps SQLite IDs to MongoDB ObjectIds
        
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
            self.sqlite_conn.row_factory = sqlite3.Row  # Enable dict-like access
            logger.info("✅ Successfully connected to SQLite database")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to connect to SQLite: {e}")
            return False
    
    def convert_datetime(self, dt_string: str) -> Optional[datetime]:
        """Convert SQLite datetime string to Python datetime"""
        if not dt_string:
            return None
        
        try:
            # Try different datetime formats
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
            
            logger.warning(f"Could not parse datetime: {dt_string}")
            return None
        except Exception as e:
            logger.warning(f"Error parsing datetime {dt_string}: {e}")
            return None
    
    def get_sqlite_data(self, table_name: str) -> List[Dict[str, Any]]:
        """Get all data from a SQLite table"""
        try:
            cursor = self.sqlite_conn.cursor()
            cursor.execute(f"SELECT * FROM {table_name}")
            rows = cursor.fetchall()
            
            # Convert rows to list of dictionaries
            data = []
            for row in rows:
                row_dict = dict(row)
                data.append(row_dict)
            
            logger.info(f"📊 Retrieved {len(data)} records from {table_name}")
            return data
        except Exception as e:
            logger.error(f"❌ Error retrieving data from {table_name}: {e}")
            return []
    
    async def migrate_users(self) -> bool:
        """Migrate users table"""
        logger.info("👥 Migrating users...")
        
        users_data = self.get_sqlite_data("users")
        if not users_data:
            logger.warning("No users found to migrate")
            return True
        
        try:
            collection = self.mongo_db.users
            migrated_users = []
            
            for user in users_data:
                # Convert SQLite data to MongoDB document
                mongo_user = {
                    "username": user["username"],
                    "email": user["email"],
                    "hashed_password": user["hashed_password"],
                    "role": user["role"],
                    "first_name": user["first_name"],
                    "last_name": user["last_name"],
                    "phone": user["phone"],
                    "address": user["address"],
                    "is_active": bool(user["is_active"]),
                    "branch_id": user["branch_id"],
                    "last_login": self.convert_datetime(user["last_login"]),
                    "created_at": self.convert_datetime(user["created_at"]) or datetime.utcnow(),
                    "sqlite_id": user["id"]  # Keep original ID for reference
                }
                
                # Insert user and store ID mapping
                result = await collection.insert_one(mongo_user)
                self.id_mapping[f"users_{user['id']}"] = result.inserted_id
                migrated_users.append(mongo_user)
            
            logger.info(f"✅ Successfully migrated {len(migrated_users)} users")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error migrating users: {e}")
            return False
    
    async def migrate_branches(self) -> bool:
        """Migrate branches table"""
        logger.info("🏢 Migrating branches...")
        
        branches_data = self.get_sqlite_data("branches")
        if not branches_data:
            logger.warning("No branches found to migrate")
            return True
        
        try:
            collection = self.mongo_db.branches
            migrated_branches = []
            
            for branch in branches_data:
                # Convert SQLite data to MongoDB document
                mongo_branch = {
                    "name": branch["name"],
                    "location": branch["location"],
                    "description": branch["description"],
                    "image_url": branch["image_url"],
                    "manager_id": branch["manager_id"],
                    "capacity": branch["capacity"],
                    "available_space": branch["available_space"],
                    "created_at": self.convert_datetime(branch["created_at"]) or datetime.utcnow(),
                    "sqlite_id": branch["id"]  # Keep original ID for reference
                }
                
                # Insert branch and store ID mapping
                result = await collection.insert_one(mongo_branch)
                self.id_mapping[f"branches_{branch['id']}"] = result.inserted_id
                migrated_branches.append(mongo_branch)
            
            logger.info(f"✅ Successfully migrated {len(migrated_branches)} branches")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error migrating branches: {e}")
            return False
    
    async def migrate_goods(self) -> bool:
        """Migrate goods table"""
        logger.info("📦 Migrating goods...")
        
        goods_data = self.get_sqlite_data("goods")
        if not goods_data:
            logger.warning("No goods found to migrate")
            return True
        
        try:
            collection = self.mongo_db.goods
            migrated_goods = []
            
            for good in goods_data:
                # Convert SQLite data to MongoDB document
                mongo_good = {
                    "name": good["name"],
                    "description": good["description"],
                    "category": good["category"],
                    "quantity": good["quantity"],
                    "price_per_unit": float(good["price_per_unit"]) if good["price_per_unit"] else 0.0,
                    "owner_id": good["owner_id"],
                    "branch_id": good["branch_id"],
                    "created_at": self.convert_datetime(good["created_at"]) or datetime.utcnow(),
                    "updated_at": self.convert_datetime(good["updated_at"]) or datetime.utcnow(),
                    "sqlite_id": good["id"]  # Keep original ID for reference
                }
                
                # Insert good and store ID mapping
                result = await collection.insert_one(mongo_good)
                self.id_mapping[f"goods_{good['id']}"] = result.inserted_id
                migrated_goods.append(mongo_good)
            
            logger.info(f"✅ Successfully migrated {len(migrated_goods)} goods")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error migrating goods: {e}")
            return False
    
    async def migrate_assignments(self) -> bool:
        """Migrate assignments table"""
        logger.info("📋 Migrating assignments...")
        
        assignments_data = self.get_sqlite_data("assignments")
        if not assignments_data:
            logger.warning("No assignments found to migrate")
            return True
        
        try:
            collection = self.mongo_db.assignments
            migrated_assignments = []
            
            for assignment in assignments_data:
                # Convert SQLite data to MongoDB document
                mongo_assignment = {
                    "employee_id": assignment["employee_id"],
                    "task": assignment["task"],
                    "description": assignment["description"],
                    "status": assignment["status"],
                    "priority": assignment["priority"],
                    "branch_id": assignment["branch_id"],
                    "due_date": self.convert_datetime(assignment["due_date"]),
                    "created_at": self.convert_datetime(assignment["created_at"]) or datetime.utcnow(),
                    "updated_at": self.convert_datetime(assignment["updated_at"]) or datetime.utcnow(),
                    "sqlite_id": assignment["id"]  # Keep original ID for reference
                }
                
                # Insert assignment and store ID mapping
                result = await collection.insert_one(mongo_assignment)
                self.id_mapping[f"assignments_{assignment['id']}"] = result.inserted_id
                migrated_assignments.append(mongo_assignment)
            
            logger.info(f"✅ Successfully migrated {len(migrated_assignments)} assignments")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error migrating assignments: {e}")
            return False
    
    async def migrate_user_activities(self) -> bool:
        """Migrate user_activities table"""
        logger.info("📊 Migrating user activities...")
        
        activities_data = self.get_sqlite_data("user_activities")
        if not activities_data:
            logger.warning("No user activities found to migrate")
            return True
        
        try:
            collection = self.mongo_db.user_activities
            migrated_activities = []
            
            for activity in activities_data:
                # Convert SQLite data to MongoDB document
                mongo_activity = {
                    "user_id": activity["user_id"],
                    "action": activity["action"],
                    "description": activity["description"],
                    "category": activity["category"],
                    "ip_address": activity["ip_address"],
                    "user_agent": activity["user_agent"],
                    "timestamp": self.convert_datetime(activity["timestamp"]) or datetime.utcnow(),
                    "sqlite_id": activity["id"]  # Keep original ID for reference
                }
                
                # Insert activity and store ID mapping
                result = await collection.insert_one(mongo_activity)
                self.id_mapping[f"user_activities_{activity['id']}"] = result.inserted_id
                migrated_activities.append(mongo_activity)
            
            logger.info(f"✅ Successfully migrated {len(migrated_activities)} user activities")
            return True
            
        except Exception as e:
            logger.error(f"❌ Error migrating user activities: {e}")
            return False
    
    async def create_indexes(self):
        """Create indexes for better performance"""
        logger.info("🔍 Creating indexes...")
        
        try:
            # Users collection indexes
            await self.mongo_db.users.create_index("username", unique=True)
            await self.mongo_db.users.create_index("email", unique=True)
            await self.mongo_db.users.create_index("role")
            await self.mongo_db.users.create_index("sqlite_id")
            
            # Branches collection indexes
            await self.mongo_db.branches.create_index("name")
            await self.mongo_db.branches.create_index("sqlite_id")
            
            # Goods collection indexes
            await self.mongo_db.goods.create_index("name")
            await self.mongo_db.goods.create_index("category")
            await self.mongo_db.goods.create_index("sqlite_id")
            
            # Assignments collection indexes
            await self.mongo_db.assignments.create_index("status")
            await self.mongo_db.assignments.create_index("priority")
            await self.mongo_db.assignments.create_index("sqlite_id")
            
            # User activities collection indexes
            await self.mongo_db.user_activities.create_index("user_id")
            await self.mongo_db.user_activities.create_index("timestamp")
            await self.mongo_db.user_activities.create_index("category")
            await self.mongo_db.user_activities.create_index("sqlite_id")
            
            logger.info("✅ Indexes created successfully")
            
        except Exception as e:
            logger.warning(f"⚠️ Some indexes might not have been created: {e}")
    
    async def verify_migration(self):
        """Verify the migration by counting documents"""
        logger.info("🔍 Verifying migration...")
        
        collections = ['users', 'branches', 'goods', 'assignments', 'user_activities']
        
        for collection_name in collections:
            try:
                mongo_count = await self.mongo_db[collection_name].count_documents({})
                
                # Get SQLite count
                cursor = self.sqlite_conn.cursor()
                cursor.execute(f"SELECT COUNT(*) FROM {collection_name}")
                sqlite_count = cursor.fetchone()[0]
                
                if mongo_count == sqlite_count:
                    logger.info(f"✅ {collection_name}: {mongo_count} documents (matches SQLite)")
                else:
                    logger.warning(f"⚠️ {collection_name}: MongoDB has {mongo_count} documents, SQLite has {sqlite_count}")
                    
            except Exception as e:
                logger.error(f"❌ Error verifying {collection_name}: {e}")
    
    async def run_migration(self):
        """Run the complete migration process"""
        logger.info("🚀 Starting data migration from SQLite to MongoDB Atlas")
        
        # Connect to databases
        if not self.connect_sqlite():
            return False
        
        if not await self.connect_mongodb():
            return False
        
        # Clear existing collections (optional - remove this if you want to keep existing data)
        logger.info("🗑️ Clearing existing MongoDB collections...")
        collections = ['users', 'branches', 'goods', 'assignments', 'user_activities']
        for collection_name in collections:
            try:
                await self.mongo_db[collection_name].delete_many({})
                logger.info(f"Cleared {collection_name} collection")
            except Exception as e:
                logger.warning(f"Could not clear {collection_name}: {e}")
        
        # Run migrations in order (considering dependencies)
        migrations = [
            self.migrate_users,
            self.migrate_branches,
            self.migrate_goods,
            self.migrate_assignments,
            self.migrate_user_activities
        ]
        
        for migration in migrations:
            if not await migration():
                logger.error(f"❌ Migration failed at {migration.__name__}")
                return False
        
        # Create indexes
        await self.create_indexes()
        
        # Verify migration
        await self.verify_migration()
        
        logger.info("🎉 Migration completed successfully!")
        return True
    
    def cleanup(self):
        """Clean up connections"""
        if self.sqlite_conn:
            self.sqlite_conn.close()
        if self.mongo_client:
            self.mongo_client.close()

async def main():
    """Main migration function"""
    migrator = DataMigrator()
    
    try:
        success = await migrator.run_migration()
        if success:
            logger.info("✅ Data migration completed successfully!")
        else:
            logger.error("❌ Data migration failed!")
    except Exception as e:
        logger.error(f"❌ Migration error: {e}")
    finally:
        migrator.cleanup()

if __name__ == "__main__":
    asyncio.run(main())
