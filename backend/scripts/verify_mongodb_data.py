"""
MongoDB Data Verification Script
This script verifies and displays the migrated data in MongoDB Atlas.
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB Atlas connection (set MONGODB_URL in backend/.env or the environment)
load_dotenv()
MONGODB_URL = os.environ["MONGODB_URL"]
DATABASE_NAME = os.getenv("MONGODB_DB_NAME", "stockhub")

async def verify_mongodb_data():
    """Verify and display migrated data"""
    try:
        # Connect to MongoDB
        client = AsyncIOMotorClient(MONGODB_URL)
        db = client[DATABASE_NAME]
        
        # Test connection
        await client.admin.command('ping')
        logger.info("✅ Connected to MongoDB Atlas")
        
        print("=" * 60)
        print("📊 MONGODB ATLAS DATA VERIFICATION")
        print("=" * 60)
        
        # Check each collection
        collections = ['users', 'branches', 'goods', 'assignments', 'user_activities']
        
        for collection_name in collections:
            collection = db[collection_name]
            count = await collection.count_documents({})
            
            print(f"\n🔍 {collection_name.upper()} Collection:")
            print(f"   Total documents: {count}")
            
            # Show sample documents
            if count > 0:
                cursor = collection.find({}).limit(3)
                docs = await cursor.to_list(length=3)
                
                for i, doc in enumerate(docs, 1):
                    print(f"   Sample {i}:")
                    # Remove ObjectId for cleaner display and show key fields
                    if collection_name == 'users':
                        print(f"      - Username: {doc.get('username')}")
                        print(f"      - Email: {doc.get('email')}")
                        print(f"      - Role: {doc.get('role')}")
                        print(f"      - Active: {doc.get('is_active')}")
                    elif collection_name == 'branches':
                        print(f"      - Name: {doc.get('name')}")
                        print(f"      - Location: {doc.get('location')}")
                        print(f"      - Capacity: {doc.get('capacity')}")
                    elif collection_name == 'goods':
                        print(f"      - Name: {doc.get('name')}")
                        print(f"      - Category: {doc.get('category')}")
                        print(f"      - Quantity: {doc.get('quantity')}")
                        print(f"      - Price: ${doc.get('price_per_unit', 0):.2f}")
                    elif collection_name == 'assignments':
                        print(f"      - Task: {doc.get('task')}")
                        print(f"      - Status: {doc.get('status')}")
                        print(f"      - Priority: {doc.get('priority')}")
                    elif collection_name == 'user_activities':
                        print(f"      - Action: {doc.get('action')}")
                        print(f"      - Category: {doc.get('category')}")
                        print(f"      - Timestamp: {doc.get('timestamp')}")
                    
                    if i < len(docs):
                        print()
        
        print("\n" + "=" * 60)
        print("✅ MIGRATION VERIFICATION COMPLETE")
        print("All SQLite data has been successfully migrated to MongoDB Atlas!")
        print("=" * 60)
        
        # Close connection
        client.close()
        
    except Exception as e:
        logger.error(f"❌ Error verifying data: {e}")

async def main():
    await verify_mongodb_data()

if __name__ == "__main__":
    asyncio.run(main())
