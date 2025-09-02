from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
from app import crud
from app import schemas
from app.database import get_db
from app.auth_handler import decode_jwt

router = APIRouter()
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    """Get current user from JWT token"""
    payload = decode_jwt(credentials.credentials)
    username = payload.get("sub")
    user = crud.get_user_by_username(db, username=username)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    return user

def require_admin(current_user = Depends(get_current_user)):
    """Require admin role"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

@router.get("/me", response_model=schemas.User)
def read_users_me(current_user = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

@router.get("/", response_model=List[schemas.User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Get all users (admin only)"""
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@router.get("/employees", response_model=List[schemas.User])
def get_employees(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get all employees"""
    employees = crud.get_users_by_role(db, role="employee", skip=skip, limit=limit)
    return employees

@router.get("/{user_id}", response_model=schemas.User)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Get user by ID (admin only)"""
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.post("/", response_model=schemas.User)
def create_user(
    user: schemas.UserCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Create new user (admin only)"""
    # Check if user already exists
    if crud.get_user_by_username(db, username=user.username):
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    if crud.get_user_by_email(db, email=user.email):
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create user
    db_user = crud.create_user(db=db, user=user)
    
    # Log activity
    crud.log_user_activity(
        db=db,
        user_id=current_user.id,
        action="User Created",
        description=f"Created new user: {user.username} ({user.email})",
        category="user_management",
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    
    return db_user

@router.put("/me", response_model=schemas.User)
def update_user_me(
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update current user profile"""
    updated_user = crud.update_user(db, current_user.id, user_update)
    return updated_user

@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Update user by ID (admin only)"""
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = crud.update_user(db, user_id, user_update)
    
    # Log activity
    crud.log_user_activity(
        db=db,
        user_id=current_user.id,
        action="User Updated",
        description=f"Updated user: {db_user.username} ({db_user.email})",
        category="user_management",
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    
    return updated_user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Delete user by ID (admin only)"""
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Log activity before deletion
    crud.log_user_activity(
        db=db,
        user_id=current_user.id,
        action="User Deleted",
        description=f"Deleted user: {db_user.username} ({db_user.email})",
        category="user_management",
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    
    crud.delete_user(db, user_id)
    return {"message": "User deleted successfully"}

@router.patch("/{user_id}/toggle-active")
def toggle_user_status(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Toggle user active status (admin only)"""
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Toggle the status
    new_status = not db_user.is_active
    user_update = schemas.UserUpdate(is_active=new_status)
    updated_user = crud.update_user(db, user_id, user_update)
    
    # Log activity
    crud.log_user_activity(
        db=db,
        user_id=current_user.id,
        action="User Status Changed",
        description=f"{'Activated' if new_status else 'Deactivated'} user: {db_user.username} ({db_user.email})",
        category="user_management",
        ip_address=request.client.host,
        user_agent=request.headers.get("user-agent")
    )
    
    return {"message": f"User {'activated' if new_status else 'deactivated'} successfully", "user": updated_user}

@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Get dashboard statistics (admin only)"""
    return crud.get_dashboard_stats(db)

@router.get("/{user_id}/activities", response_model=List[schemas.UserActivity])
def get_user_activities(
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Get user activity logs (admin only)"""
    # Verify user exists
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    activities = crud.get_user_activities(db, user_id=user_id, skip=skip, limit=limit)
    return activities
