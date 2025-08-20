# StockHub Backend - Architecture & Logic Guide

## Overview
StockHub backend is a FastAPI-based warehouse management system with SQLAlchemy ORM, JWT authentication, and role-based access control. This guide explains the backend logic step by step.

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Database Models & Relationships](#database-models--relationships)
- [Request Flow](#request-flow)
- [Authentication & Authorization](#authentication--authorization)
- [API Endpoints](#api-endpoints)
- [CRUD Operations](#crud-operations)
- [Schemas & Validation](#schemas--validation)
- [Error Handling](#error-handling)
- [Setup & Testing](#setup--testing)

## Architecture Overview

The backend follows a layered architecture:

```
┌─────────────────────────────────────────┐
│             Client (Frontend)           │
└─────────────────┬───────────────────────┘
                  │ HTTP Requests
┌─────────────────▼───────────────────────┐
│         FastAPI Routers                 │
│   (auth.py, goods.py, users.py, etc)   │
└─────────────────┬───────────────────────┘
                  │ Function Calls
┌─────────────────▼───────────────────────┐
│           CRUD Operations               │
│         (crud.py functions)             │
└─────────────────┬───────────────────────┘
                  │ ORM Queries
┌─────────────────▼───────────────────────┐
│         SQLAlchemy Models               │
│         (database.py classes)           │
└─────────────────┬───────────────────────┘
                  │ SQL Commands
┌─────────────────▼───────────────────────┐
│           SQLite Database               │
│         (stockhub.db file)              │
└─────────────────────────────────────────┘
```

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # SQLAlchemy models & DB config
│   ├── schemas.py           # Pydantic models for validation
│   ├── crud.py              # Database operations
│   ├── seed_data.py         # Sample data creation
│   ├── auth/
│   │   ├── dependencies.py  # Auth dependencies
│   │   └── jwt_handler.py   # JWT token management
│   └── routers/
│       ├── auth.py          # Login/logout endpoints
│       ├── goods.py         # Goods management
│       ├── users.py         # User management
│       ├── branches.py      # Branch management
│       └── assignments.py   # Task assignments
├── requirements.txt         # Python dependencies
└── stockhub.db             # SQLite database file
```

## Database Models & Relationships

### Core Models

#### 1. User Model
```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(String)  # customer, employee, admin
    first_name = Column(String)
    last_name = Column(String)
    phone = Column(String)
    address = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    goods = relationship("Goods", back_populates="owner")
    assignments = relationship("Assignment", back_populates="employee")
```

#### 2. Goods Model
```python
class Goods(Base):
    __tablename__ = "goods"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    category = Column(String)
    quantity = Column(Integer)
    price_per_unit = Column(Float)
    owner_id = Column(Integer, ForeignKey("users.id"))  # FK to users
    branch_id = Column(Integer, ForeignKey("branches.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="goods")
    branch = relationship("Branch", back_populates="goods")
```

### Foreign Key Relationships

The system uses foreign keys to maintain data integrity:

1. **goods.owner_id → users.id**: Every good must belong to a valid user
2. **goods.branch_id → branches.id**: Goods can be assigned to branches
3. **assignments.employee_id → users.id**: Tasks assigned to employees
4. **branches.manager_id → users.id**: Branches have managers

```sql
-- Example join query using the foreign key
SELECT * FROM goods 
INNER JOIN users ON goods.owner_id = users.id;
```

## Request Flow

### 1. Typical API Request Flow

```
1. Client Request
   ↓
2. FastAPI Router (endpoint function)
   ↓
3. Dependencies Injection
   - get_db() → Database session
   - get_current_user() → Authenticated user
   ↓
4. Request Validation (Pydantic schemas)
   ↓
5. Business Logic (CRUD operations)
   ↓
6. Database Operations (SQLAlchemy ORM)
   ↓
7. Response Serialization (Pydantic models)
   ↓
8. HTTP Response to Client
```

### 2. Example: Creating a Good

```python
# 1. Router receives request
@router.post("/", response_model=schemas.Goods)
def create_good(
    good: schemas.GoodsCreate,           # 2. Request validation
    db: Session = Depends(get_db),       # 3. DB session dependency
    current_user = Depends(get_current_user)  # 4. Auth dependency
):
    # 5. Business logic - call CRUD function
    return crud.create_goods(db=db, goods=good, owner_id=current_user.id)

# 6. CRUD function performs DB operation
def create_goods(db: Session, goods: GoodsCreate, owner_id: int):
    db_goods = Goods(**goods.dict(), owner_id=owner_id)  # 7. Create model
    db.add(db_goods)                                     # 8. Add to session
    db.commit()                                          # 9. Commit transaction
    db.refresh(db_goods)                                 # 10. Refresh from DB
    return db_goods                                      # 11. Return created object
```

## Authentication & Authorization

### 1. Authentication Flow

```
1. User Login Request
   ├── Username/Password provided
   ↓
2. Credential Verification
   ├── Check user exists in database
   ├── Verify password hash
   ↓
3. JWT Token Generation
   ├── Create token with user info
   ├── Set expiration time
   ↓
4. Token Response
   └── Return access_token + user data
```

### 2. Authorization Levels

```python
# Role hierarchy
ROLES = {
    "customer": ["own_data"],
    "employee": ["own_data", "manage_goods", "manage_assignments"],
    "admin": ["own_data", "manage_goods", "manage_assignments", "manage_users"]
}
```

### 3. Permission Checks

```python
# Example permission check in goods router
def update_good(good_id: int, current_user):
    db_good = crud.get_good(db, good_id=good_id)
    
    # Check ownership or admin/employee role
    if db_good.owner_id != current_user.id and current_user.role not in ["employee", "admin"]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
```

## API Endpoints

### Authentication Endpoints
```
POST /auth/login
- Input: {username, password}
- Output: {access_token, token_type, user}
- Purpose: Authenticate user and get JWT token

POST /auth/register
- Input: UserCreate schema
- Output: Created user
- Purpose: Create new user account
```

### Goods Management
```
GET /goods/
- Query params: skip, limit, category, search
- Output: List[Goods]
- Auth: None required
- Purpose: List all goods with filtering

GET /goods/my-goods
- Query params: skip, limit
- Output: List[Goods] (filtered by owner)
- Auth: Required
- Purpose: Get current user's goods

POST /goods/
- Input: GoodsCreate schema
- Output: Created Goods
- Auth: Required
- Purpose: Create new good (owner_id set automatically)

PUT /goods/{good_id}
- Input: GoodsUpdate schema
- Output: Updated Goods
- Auth: Required (owner or employee/admin)
- Purpose: Update existing good

DELETE /goods/{good_id}
- Output: Success message
- Auth: Required (owner or employee/admin)
- Purpose: Delete good
```

### User Management
```
GET /users/
- Query params: skip, limit
- Output: List[User]
- Auth: Required (admin only)
- Purpose: List all users

GET /users/{user_id}
- Output: User
- Auth: Required (own profile or admin)
- Purpose: Get user details

PUT /users/{user_id}
- Input: UserUpdate schema
- Output: Updated User
- Auth: Required (own profile or admin)
- Purpose: Update user profile
```

## CRUD Operations

### Design Pattern
All CRUD operations follow a consistent pattern:

```python
# CREATE
def create_item(db: Session, item: ItemCreate, **kwargs):
    db_item = ItemModel(**item.dict(), **kwargs)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

# READ (single)
def get_item(db: Session, item_id: int):
    return db.query(ItemModel).filter(ItemModel.id == item_id).first()

# READ (multiple)
def get_items(db: Session, skip: int = 0, limit: int = 100):
    return db.query(ItemModel).offset(skip).limit(limit).all()

# UPDATE
def update_item(db: Session, item_id: int, item_update: ItemUpdate):
    db_item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if db_item:
        update_data = item_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_item, field, value)
        db.commit()
        db.refresh(db_item)
    return db_item

# DELETE
def delete_item(db: Session, item_id: int):
    db_item = db.query(ItemModel).filter(ItemModel.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
    return db_item
```

### Key CRUD Functions

#### Goods Operations
```python
get_goods(db, skip, limit, category, search)  # List with filtering
get_goods_by_owner(db, owner_id, skip, limit) # Filter by owner
create_goods(db, goods, owner_id)             # Create with owner
update_goods(db, good_id, goods_update)       # Update existing
delete_goods(db, good_id)                     # Delete by ID
```

#### User Operations
```python
get_user_by_username(db, username)            # Find by username
get_user_by_email(db, email)                  # Find by email
authenticate_user(db, username, password)     # Login verification
create_user(db, user)                         # Register new user
update_user(db, user_id, user_update)         # Update profile
```

## Schemas & Validation

### Schema Types

#### 1. Base Schemas
```python
class GoodsBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    quantity: int
    price_per_unit: float
```

#### 2. Input Schemas (for API requests)
```python
class GoodsCreate(GoodsBase):
    branch_id: Optional[int] = None
    # Note: owner_id is set automatically by the server

class GoodsUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    price_per_unit: Optional[float] = None
    branch_id: Optional[int] = None
```

#### 3. Output Schemas (for API responses)
```python
class Goods(GoodsBase):
    id: int
    owner_id: int                    # Automatically included
    branch_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True       # Enables SQLAlchemy model conversion
```

### Validation Rules

- **Required fields**: name, category, quantity, price_per_unit
- **Optional fields**: description, branch_id
- **Auto-generated**: id, owner_id, created_at, updated_at
- **Email validation**: Uses EmailStr for user emails
- **Type validation**: Pydantic enforces correct data types

## Error Handling

### Common HTTP Status Codes

```python
200 # OK - Successful request
201 # Created - Resource created successfully
400 # Bad Request - Invalid input data
401 # Unauthorized - Authentication required
403 # Forbidden - Insufficient permissions
404 # Not Found - Resource doesn't exist
422 # Unprocessable Entity - Validation error
500 # Internal Server Error - Server error
```

### Error Response Format
```python
{
    "detail": "Error message describing what went wrong"
}
```

### Common Error Scenarios

#### 1. Authentication Errors
```python
# Missing or invalid JWT token
HTTPException(status_code=401, detail="Could not validate credentials")

# User not found
HTTPException(status_code=401, detail="Invalid username or password")
```

#### 2. Authorization Errors
```python
# Insufficient permissions
HTTPException(status_code=403, detail="Not enough permissions")

# Not resource owner
HTTPException(status_code=403, detail="You can only modify your own goods")
```

#### 3. Resource Errors
```python
# Resource not found
HTTPException(status_code=404, detail="Good not found")

# Duplicate resource
HTTPException(status_code=400, detail="Username already exists")
```

#### 4. Validation Errors
```python
# Pydantic validation (automatic)
{
    "detail": [
        {
            "loc": ["body", "price_per_unit"],
            "msg": "ensure this value is greater than 0",
            "type": "value_error.number.not_gt"
        }
    ]
}
```

## Setup & Testing

### 1. Environment Setup

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Run seed data script to create tables and sample data
cd app
python seed_data.py
```

### 3. Start Server

```bash
# Development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 4. API Testing

#### Using curl:
```bash
# Login to get token
curl -X POST "http://localhost:8000/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"username": "customer1", "password": "cust123"}'

# Use token to create goods
curl -X POST "http://localhost:8000/goods/" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name": "Test Item", "category": "Electronics", "quantity": 10, "price_per_unit": 99.99}'
```

#### Using FastAPI docs:
Visit `http://localhost:8000/docs` for interactive API documentation.

### 5. Database Inspection

```bash
# Check database schema
sqlite3 stockhub.db "PRAGMA table_info('goods');"

# View foreign keys
sqlite3 stockhub.db "PRAGMA foreign_key_list('goods');"

# Query data
sqlite3 stockhub.db "SELECT * FROM goods JOIN users ON goods.owner_id = users.id;"
```

### 6. Sample Test Data

The seed script creates:
- **Users**: admin, employee1, customer1 (passwords: admin123, emp123, cust123)
- **Branches**: New York, Los Angeles, Chicago
- **Goods**: MacBook Pro, iPhone 15, Office Chair, Standing Desk
- **Assignments**: Inventory check, stock replenishment tasks

## Key Design Decisions

### 1. Foreign Key Usage
- **Decision**: Use `owner_id` foreign key in goods table
- **Benefit**: Ensures data integrity, enables efficient joins
- **Implementation**: `owner_id = Column(Integer, ForeignKey("users.id"))`

### 2. Role-Based Access Control
- **Decision**: Simple role hierarchy (customer < employee < admin)
- **Benefit**: Clear permission model, easy to understand
- **Implementation**: String-based roles with programmatic checks

### 3. JWT Authentication
- **Decision**: Stateless JWT tokens instead of sessions
- **Benefit**: Scalable, works well with SPAs
- **Implementation**: PyJWT library with user info in payload

### 4. SQLAlchemy ORM
- **Decision**: Use ORM instead of raw SQL
- **Benefit**: Type safety, relationship management, migration support
- **Implementation**: Declarative models with relationships

### 5. Pydantic Validation
- **Decision**: Separate schemas for input/output validation
- **Benefit**: Clear API contracts, automatic validation
- **Implementation**: BaseModel classes with type hints

This backend provides a solid foundation for a warehouse management system with proper authentication, authorization, and data integrity through foreign key relationships.
