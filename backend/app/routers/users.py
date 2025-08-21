from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List
import crud
import schemas
from database import get_db, Goods
from auth_handler import decode_jwt

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
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Update user by ID (admin only)"""
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    updated_user = crud.update_user(db, user_id, user_update)
    return updated_user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Delete user by ID (admin only)"""
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    crud.delete_user(db, user_id)
    return {"message": "User deleted successfully"}

@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user = Depends(require_admin)
):
    """Get dashboard statistics (admin only)"""
    return crud.get_dashboard_stats(db)

@router.get("/me/stats")
def get_customer_stats(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get current customer's statistics"""
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can access this endpoint"
        )
    
    # Get customer's goods count
    goods_count = db.query(Goods).filter(Goods.owner_id == current_user.id).count()
    
    # Mock data for now - you can implement real logic later
    return {
        "total_goods": goods_count,
        "active_orders": 3,
        "completed_orders": 18,
        "warehouse_value": 15420
    }

@router.get("/me/activity")
def get_customer_activity(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get current customer's recent activity"""
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can access this endpoint"
        )
    
    # Mock activity data - implement real logic based on your needs
    activity = [
        {
            "id": 1,
            "type": "order_created",
            "title": "New storage order created",
            "description": f"Order for {current_user.first_name}'s goods storage",
            "timestamp": "2024-08-21T10:30:00Z",
            "status": "pending"
        },
        {
            "id": 2,
            "type": "goods_delivered",
            "title": "Goods delivered to warehouse",
            "description": "Items delivered to Warehouse Branch A",
            "timestamp": "2024-08-20T14:15:00Z",
            "status": "completed"
        }
    ]
    
    return activity
