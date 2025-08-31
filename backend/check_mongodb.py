"""
Verify MongoDB collections after sync
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

MONGODB_URL = "mongodb+srv://user3:kUNUn0gVmEWbKsc4@cluster1.o6n4bor.mongodb.net/stockhub?retryWrites=true&w=majority&appName=Cluster1"
DATABASE_NAME = "stockhub"

async def verify_mongodb_collections():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]
    
    print("MongoDB Collections After Sync:")
    
    collections = ['users', 'branches', 'goods', 'assignments', 'user_activities', 'customer_applications']
    
    for collection_name in collections:
        try:
            count = await db[collection_name].count_documents({})
            print(f"- {collection_name}: {count} documents")
        except Exception as e:
            print(f"- {collection_name}: Error - {e}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(verify_mongodb_collections())
