"""
MongoDB CRUD router for Users collection
"""
from fastapi import APIRouter, HTTPException, status
from typing import List
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from datetime import datetime

from app.mongodb import get_database
from app.mongo_models import MongoUser, UserCreate

router = APIRouter()

def get_users_collection():
    """Get the users collection from database"""
    db = get_database()
    return db.users

@router.post("/", response_model=MongoUser, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate):
    """Create a new user"""
    collection = get_users_collection()
    
    # Convert to dict and add timestamps
    user_dict = user_data.dict()
    user_dict["created_at"] = datetime.utcnow()
    user_dict["is_active"] = True
    user_dict["sqlite_id"] = -1  # New users get -1 to distinguish from migrated ones
    
    try:
        result = await collection.insert_one(user_dict)
        created_user = await collection.find_one({"_id": result.inserted_id})
        
        if created_user:
            created_user["_id"] = str(created_user["_id"])
            return MongoUser(**created_user)
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user"
            )
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this username or email already exists"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating the user: {str(e)}"
        )

@router.get("/", response_model=List[MongoUser])
async def get_all_users():
    """Get all users"""
    collection = get_users_collection()
    
    try:
        cursor = collection.find({})
        users = []
        
        async for document in cursor:
            document["_id"] = str(document["_id"])
            users.append(MongoUser(**document))
        
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching users: {str(e)}"
        )

@router.get("/{user_id}", response_model=MongoUser)
async def get_user_by_id(user_id: str):
    """Get a user by ID"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    collection = get_users_collection()
    
    try:
        user = await collection.find_one({"_id": ObjectId(user_id)})
        
        if user:
            user["_id"] = str(user["_id"])
            return MongoUser(**user)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching the user: {str(e)}"
        )

@router.get("/by-role/{role}", response_model=List[MongoUser])
async def get_users_by_role(role: str):
    """Get users by role"""
    collection = get_users_collection()
    
    try:
        cursor = collection.find({"role": role})
        users = []
        
        async for document in cursor:
            document["_id"] = str(document["_id"])
            users.append(MongoUser(**document))
        
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching users by role: {str(e)}"
        )
