"""
Enhanced MongoDB Pydantic models for all migrated collections
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class MongoUser(BaseModel):
    """MongoDB User model"""
    id: str = Field(alias="_id")
    username: str
    email: str
    hashed_password: str
    role: str  # customer, employee, admin
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: bool = True
    branch_id: Optional[int] = None
    last_login: Optional[datetime] = None
    created_at: datetime
    sqlite_id: int  # Original SQLite ID for reference
    
    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str}
    )

class UserCreate(BaseModel):
    """Create user model"""
    username: str
    email: str
    password: str
    role: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    branch_id: Optional[int] = None

class MongoBranch(BaseModel):
    """MongoDB Branch model"""
    id: str = Field(alias="_id")
    name: str
    location: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    manager_id: Optional[int] = None
    capacity: Optional[int] = None
    available_space: Optional[int] = None
    created_at: datetime
    sqlite_id: int  # Original SQLite ID for reference
    
    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str}
    )

class BranchCreate(BaseModel):
    """Create branch model"""
    name: str
    location: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    manager_id: Optional[int] = None
    capacity: Optional[int] = None
    available_space: Optional[int] = None

class MongoGoods(BaseModel):
    """MongoDB Goods model"""
    id: str = Field(alias="_id")
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    sku: Optional[str] = None
    supplier: Optional[str] = None
    quantity: int
    price_per_unit: float
    low_stock_threshold: int = 10
    batch_no: Optional[str] = None
    expiry_date: Optional[str] = None
    owner_id: Optional[int] = None
    branch_id: Optional[int] = None
    product_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    sqlite_id: int  # Original SQLite ID for reference
    
    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str}
    )

class GoodsCreate(BaseModel):
    """Create goods model"""
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    sku: Optional[str] = None
    supplier: Optional[str] = None
    quantity: int = Field(..., ge=0)
    price_per_unit: float = Field(..., ge=0)
    low_stock_threshold: int = Field(10, ge=0)
    batch_no: Optional[str] = None
    expiry_date: Optional[str] = None
    owner_id: Optional[int] = None
    branch_id: Optional[int] = None
    product_id: Optional[str] = None

class GoodsUpdate(BaseModel):
    """Update goods model"""
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    sku: Optional[str] = None
    supplier: Optional[str] = None
    quantity: Optional[int] = Field(None, ge=0)
    price_per_unit: Optional[float] = Field(None, ge=0)
    low_stock_threshold: Optional[int] = Field(None, ge=0)
    batch_no: Optional[str] = None
    expiry_date: Optional[str] = None
    owner_id: Optional[int] = None
    branch_id: Optional[int] = None
    product_id: Optional[str] = None

class MongoAssignment(BaseModel):
    """MongoDB Assignment model"""
    id: str = Field(alias="_id")
    employee_id: Optional[int] = None
    task: str
    description: Optional[str] = None
    status: str = "pending"  # pending, in_progress, completed
    priority: str = "medium"  # low, medium, high
    branch_id: Optional[int] = None
    due_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    sqlite_id: int  # Original SQLite ID for reference
    
    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str}
    )

class AssignmentCreate(BaseModel):
    """Create assignment model"""
    employee_id: Optional[int] = None
    task: str
    description: Optional[str] = None
    status: str = "pending"
    priority: str = "medium"
    branch_id: Optional[int] = None
    due_date: Optional[datetime] = None

class MongoUserActivity(BaseModel):
    """MongoDB User Activity model"""
    id: str = Field(alias="_id")
    user_id: int
    action: str
    description: Optional[str] = None
    category: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    timestamp: datetime
    sqlite_id: int  # Original SQLite ID for reference
    
    model_config = ConfigDict(
        populate_by_name=True,
        json_encoders={ObjectId: str}
    )

class UserActivityCreate(BaseModel):
    """Create user activity model"""
    user_id: int
    action: str
    description: Optional[str] = None
    category: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

# Authentication-specific models
class UserLogin(BaseModel):
    """User login model"""
    username: str
    password: str

class UserResponse(BaseModel):
    """User response model"""
    id: str
    username: str
    email: str
    role: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime] = None

class UserUpdate(BaseModel):
    """User update model for PATCH/PUT operations"""
    username: Optional[str] = None
    email: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None
    branch_id: Optional[int] = None

class Token(BaseModel):
    """JWT Token model"""
    access_token: str
    token_type: str = "bearer"
