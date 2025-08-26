"""
MongoDB Authentication router - handles user registration and login with MongoDB Atlas
Replaces SQLite-based authentication with MongoDB operations
"""
from fastapi import APIRouter, HTTPException, status, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from datetime import datetime, timedelta
from typing import Optional, List
from bson import ObjectId
from pymongo.errors import DuplicateKeyError

from app.mongodb import get_database
from app.mongo_models import MongoUser, UserCreate, UserLogin, UserResponse, UserUpdate, Token
from app.auth_handler import (
    create_access_token, 
    decode_jwt, 
    get_password_hash, 
    verify_password, 
    ACCESS_TOKEN_EXPIRE_MINUTES
)

router = APIRouter()
security = HTTPBearer()

def get_users_collection():
    """Get the users collection from MongoDB database"""
    db = get_database()
    return db.users

async def get_user_by_username(username: str):
    """Get user by username from MongoDB"""
    collection = get_users_collection()
    return await collection.find_one({"username": username})

async def get_user_by_email(email: str):
    """Get user by email from MongoDB"""
    collection = get_users_collection()
    return await collection.find_one({"email": email})

async def get_user_by_id(user_id: str):
    """Get user by ID from MongoDB"""
    collection = get_users_collection()
    try:
        return await collection.find_one({"_id": ObjectId(user_id)})
    except:
        return None

async def authenticate_user(username: str, password: str):
    """Authenticate user credentials against MongoDB"""
    user = await get_user_by_username(username)
    if not user:
        return False
    if not verify_password(password, user["hashed_password"]):
        return False
    return user

async def log_user_activity(user_id: str, action: str, description: str, category: str = "auth", ip_address: str = None, user_agent: str = None):
    """Log user activity to MongoDB"""
    db = get_database()
    activity_collection = db.user_activities
    
    activity_data = {
        "user_id": user_id,
        "action": action,
        "description": description,
        "category": category,
        "ip_address": ip_address,
        "user_agent": user_agent,
        "timestamp": datetime.utcnow()
    }
    
    await activity_collection.insert_one(activity_data)

async def get_current_user_from_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token for internal use"""
    try:
        payload = decode_jwt(credentials.credentials)
        username = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from MongoDB
    user = await get_user_by_username(username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

async def require_admin(current_user = Depends(get_current_user_from_token)):
    """Require admin role for MongoDB operations"""
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, request: Request):
    """Register a new user and store in MongoDB"""
    collection = get_users_collection()
    
    # Check if username already exists
    existing_user = await get_user_by_username(user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = await get_user_by_email(user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user document
    user_doc = {
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": hashed_password,
        "role": user_data.role,
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "phone": user_data.phone,
        "address": user_data.address,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "last_login": None
    }
    
    try:
        # Insert user into MongoDB
        result = await collection.insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        # Log registration activity
        await log_user_activity(
            user_id=user_id,
            action="Register",
            description="New user registered to the system",
            category="auth",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )
        
        return {
            "message": "User created successfully",
            "user_id": user_id,
            "username": user_data.username,
            "email": user_data.email
        }
        
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this username or email already exists"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@router.post("/admin/create-user", status_code=status.HTTP_201_CREATED)
async def admin_create_user(
    user_data: UserCreate, 
    request: Request,
    current_user = Depends(require_admin)
):
    """Create a new user (admin only) - stores in MongoDB"""
    collection = get_users_collection()
    
    # Check if username already exists
    existing_user = await get_user_by_username(user_data.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email already exists
    existing_email = await get_user_by_email(user_data.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user document
    user_doc = {
        "username": user_data.username,
        "email": user_data.email,
        "hashed_password": hashed_password,
        "role": user_data.role,
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "phone": user_data.phone,
        "address": user_data.address,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "last_login": None
    }
    
    try:
        # Insert user into MongoDB
        result = await collection.insert_one(user_doc)
        user_id = str(result.inserted_id)
        
        # Log admin create user activity
        await log_user_activity(
            user_id=str(current_user["_id"]),
            action="User Created",
            description=f"Created new user: {user_data.username} ({user_data.email})",
            category="user_management",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent")
        )
        
        return {
            "message": "User created successfully by admin",
            "user_id": user_id,
            "username": user_data.username,
            "email": user_data.email,
            "role": user_data.role,
            "created_by": current_user["username"]
        }
        
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this username or email already exists"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )

@router.post("/login", response_model=Token)
async def login_user(user_credentials: UserLogin, request: Request):
    """Login user and return JWT access token - validates against MongoDB"""
    # Authenticate against MongoDB
    user = await authenticate_user(user_credentials.username, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login time in MongoDB
    collection = get_users_collection()
    await collection.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    
    # Log login activity to MongoDB
    await log_user_activity(
        user_id=str(user["_id"]),
        action="Login",
        description="User logged into the system",
        category="auth",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent")
    )
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={
            "sub": user["username"], 
            "role": user["role"], 
            "user_id": str(user["_id"])
        },
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user information from MongoDB"""
    # Verify token
    try:
        payload = decode_jwt(credentials.credentials)
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except HTTPException:
        # Re-raise HTTP exceptions from decode_jwt
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user from MongoDB
    user = await get_user_by_username(username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Prepare user data for response
    user_data = {
        "id": str(user["_id"]),
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
        "first_name": user.get("first_name"),
        "last_name": user.get("last_name"),
        "phone": user.get("phone"),
        "address": user.get("address"),
        "is_active": user["is_active"],
        "created_at": user["created_at"],
        "last_login": user.get("last_login")
    }
    
    return UserResponse(**user_data)

@router.get("/admin/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    current_user = Depends(require_admin)
):
    """Get all users from MongoDB (admin only) - sorted by creation time descending"""
    collection = get_users_collection()
    
    try:
        # Fetch users sorted by created_at in descending order (newest first)
        cursor = collection.find().sort("created_at", -1).skip(skip).limit(limit)
        users = await cursor.to_list(length=limit)
        
        # Convert users to UserResponse format
        user_list = []
        for user in users:
            user_data = {
                "id": str(user["_id"]),
                "username": user["username"],
                "email": user["email"],
                "role": user["role"],
                "first_name": user.get("first_name"),
                "last_name": user.get("last_name"),
                "phone": user.get("phone"),
                "address": user.get("address"),
                "is_active": user["is_active"],
                "created_at": user["created_at"],
                "last_login": user.get("last_login")
            }
            user_list.append(UserResponse(**user_data))
        
        return user_list
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users: {str(e)}"
        )

@router.get("/admin/users/{user_id}", response_model=UserResponse)
async def get_user_by_id_endpoint(
    user_id: str,
    current_user = Depends(require_admin)
):
    """Get user by ID from MongoDB (admin only)"""
    try:
        user = await get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prepare user data for response
        user_data = {
            "id": str(user["_id"]),
            "username": user["username"],
            "email": user["email"],
            "role": user["role"],
            "first_name": user.get("first_name"),
            "last_name": user.get("last_name"),
            "phone": user.get("phone"),
            "address": user.get("address"),
            "is_active": user["is_active"],
            "created_at": user["created_at"],
            "last_login": user.get("last_login")
        }
        
        return UserResponse(**user_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user: {str(e)}"
        )

@router.put("/admin/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_update: UserUpdate,
    current_user = Depends(require_admin)
):
    """Update user by ID (admin only)"""
    collection = get_users_collection()
    
    try:
        # Check if user exists
        existing_user = await collection.find_one({"_id": ObjectId(user_id)})
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prepare update data (only include non-None fields)
        update_data = user_update.dict(exclude_unset=True)
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )
        
        # Add updated timestamp
        update_data["updated_at"] = datetime.utcnow()
        
        # Check for duplicate username/email if being updated
        if "username" in update_data:
            existing_username = await get_user_by_username(update_data["username"])
            if existing_username and str(existing_username["_id"]) != user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already exists"
                )
        
        if "email" in update_data:
            existing_email = await get_user_by_email(update_data["email"])
            if existing_email and str(existing_email["_id"]) != user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already exists"
                )
        
        # Update user in MongoDB
        await collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_data}
        )
        
        # Log admin update activity
        await log_user_activity(
            user_id=str(current_user["_id"]),
            action="User Updated",
            description=f"Updated user: {existing_user['username']} ({existing_user['email']})",
            category="user_management"
        )
        
        # Get updated user
        updated_user = await collection.find_one({"_id": ObjectId(user_id)})
        
        # Prepare response data
        user_data = {
            "id": str(updated_user["_id"]),
            "username": updated_user["username"],
            "email": updated_user["email"],
            "role": updated_user["role"],
            "first_name": updated_user.get("first_name"),
            "last_name": updated_user.get("last_name"),
            "phone": updated_user.get("phone"),
            "address": updated_user.get("address"),
            "is_active": updated_user["is_active"],
            "created_at": updated_user["created_at"],
            "last_login": updated_user.get("last_login")
        }
        
        return UserResponse(**user_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )

@router.patch("/admin/users/{user_id}/toggle-active")
async def toggle_user_active_status(
    user_id: str,
    current_user = Depends(require_admin)
):
    """Toggle user active/inactive status (admin only)"""
    collection = get_users_collection()
    
    try:
        # Check if user exists
        existing_user = await collection.find_one({"_id": ObjectId(user_id)})
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent admin from deactivating themselves
        if str(existing_user["_id"]) == str(current_user["_id"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot deactivate your own account"
            )
        
        # Toggle active status
        new_status = not existing_user["is_active"]
        
        # Update user in MongoDB
        await collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {
                "is_active": new_status,
                "updated_at": datetime.utcnow()
            }}
        )
        
        # Log admin activity
        action = "User Activated" if new_status else "User Deactivated"
        await log_user_activity(
            user_id=str(current_user["_id"]),
            action=action,
            description=f"{action.split()[1]} user: {existing_user['username']} ({existing_user['email']})",
            category="user_management"
        )
        
        return {
            "message": f"User {'activated' if new_status else 'deactivated'} successfully",
            "user_id": user_id,
            "is_active": new_status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to toggle user status: {str(e)}"
        )

@router.delete("/admin/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user = Depends(require_admin)
):
    """Delete user by ID (admin only)"""
    collection = get_users_collection()
    
    try:
        # Check if user exists
        existing_user = await collection.find_one({"_id": ObjectId(user_id)})
        if not existing_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Prevent admin from deleting themselves
        if str(existing_user["_id"]) == str(current_user["_id"]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )
        
        # Delete user from MongoDB
        result = await collection.delete_one({"_id": ObjectId(user_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Log admin delete activity
        await log_user_activity(
            user_id=str(current_user["_id"]),
            action="User Deleted",
            description=f"Deleted user: {existing_user['username']} ({existing_user['email']})",
            category="user_management"
        )
        
        return {
            "message": "User deleted successfully",
            "user_id": user_id,
            "deleted_username": existing_user["username"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )
