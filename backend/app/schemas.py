from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str
    role: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class User(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Auth Schemas
class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# Goods Schemas
class GoodsBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    quantity: int
    price_per_unit: float

class GoodsCreate(GoodsBase):
    branch_id: Optional[int] = None

class GoodsUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    price_per_unit: Optional[float] = None
    branch_id: Optional[int] = None

class Goods(GoodsBase):
    id: int
    owner_id: int
    branch_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Branch Schemas
class BranchBase(BaseModel):
    name: str
    location: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    capacity: Optional[int] = None
    available_space: Optional[int] = None

class BranchCreate(BranchBase):
    manager_id: Optional[int] = None

class BranchUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    capacity: Optional[int] = None
    available_space: Optional[int] = None
    manager_id: Optional[int] = None

class Branch(BranchBase):
    id: int
    manager_id: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Assignment Schemas
class AssignmentBase(BaseModel):
    task: str
    description: Optional[str] = None
    priority: str = "medium"
    due_date: Optional[datetime] = None

class AssignmentCreate(AssignmentBase):
    employee_id: int
    branch_id: Optional[int] = None

class AssignmentUpdate(BaseModel):
    task: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[datetime] = None

class Assignment(AssignmentBase):
    id: int
    employee_id: int
    status: str
    branch_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Dashboard Schemas
class DashboardStats(BaseModel):
    total_users: int
    total_goods: int
    total_branches: int
    total_assignments: int
    pending_assignments: int
