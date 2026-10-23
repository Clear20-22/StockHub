"""
MongoDB CRUD router for Users collection (admin only)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
from datetime import datetime
import logging

from app.mongodb import get_database
from app.mongo_models import UserCreate, UserResponse
from app.auth_handler import get_password_hash
from app.identity import find_identity_conflict
from app.mongo_auth_dependencies import require_mongo_admin

logger = logging.getLogger(__name__)

router = APIRouter(dependencies=[Depends(require_mongo_admin)])

def get_users_collection():
    """Get the users collection from database"""
    db = get_database()
    return db.users

def to_user_response(document: dict) -> UserResponse:
    """Build the public user view (never includes the password hash)"""
    return UserResponse(
        id=str(document["_id"]),
        username=document["username"],
        email=document["email"],
        role=document["role"],
        first_name=document.get("first_name"),
        last_name=document.get("last_name"),
        phone=document.get("phone"),
        address=document.get("address"),
        is_active=document.get("is_active", True),
        created_at=document["created_at"],
        last_login=document.get("last_login"),
    )

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(user_data: UserCreate):
    """Create a new user"""
    collection = get_users_collection()

    conflict = await find_identity_conflict(username=user_data.username, email=user_data.email)
    if conflict:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=conflict)

    # Convert to dict, hash the password and add timestamps
    user_dict = user_data.dict(exclude={"password"})
    user_dict["hashed_password"] = get_password_hash(user_data.password)
    user_dict["created_at"] = datetime.utcnow()
    user_dict["is_active"] = True
    user_dict["sqlite_id"] = -1  # New users get -1 to distinguish from migrated ones

    try:
        result = await collection.insert_one(user_dict)
        created_user = await collection.find_one({"_id": result.inserted_id})
        return to_user_response(created_user)
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this username or email already exists"
        )
    except Exception:
        logger.exception("An error occurred while creating the user")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the user"
        )

@router.get("/", response_model=List[UserResponse])
async def get_all_users():
    """Get all users"""
    collection = get_users_collection()

    try:
        return [to_user_response(document) async for document in collection.find({})]
    except Exception:
        logger.exception("An error occurred while fetching users")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching users"
        )

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(user_id: str):
    """Get a user by ID"""
    if not ObjectId.is_valid(user_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )

    user = await get_users_collection().find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return to_user_response(user)

@router.get("/by-role/{role}", response_model=List[UserResponse])
async def get_users_by_role(role: str):
    """Get users by role"""
    collection = get_users_collection()

    try:
        return [to_user_response(document) async for document in collection.find({"role": role})]
    except Exception:
        logger.exception("An error occurred while fetching users by role")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching users by role"
        )
