from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
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

def require_employee_or_admin(current_user = Depends(get_current_user)):
    """Require employee or admin role"""
    if current_user.role not in ["employee", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

@router.get("/", response_model=List[schemas.Goods])
def read_goods(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all goods with optional filtering"""
    goods = crud.get_goods(db, skip=skip, limit=limit, category=category, search=search)
    return goods

@router.get("/my-goods", response_model=List[schemas.Goods])
def read_my_goods(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get current user's goods"""
    goods = crud.get_goods_by_owner(db, owner_id=current_user.id, skip=skip, limit=limit)
    return goods

@router.get("/{good_id}", response_model=schemas.Goods)
def read_good(
    good_id: int,
    db: Session = Depends(get_db)
):
    """Get good by ID"""
    db_good = crud.get_good(db, good_id=good_id)
    if db_good is None:
        raise HTTPException(status_code=404, detail="Good not found")
    return db_good

@router.post("/", response_model=schemas.Goods)
def create_good(
    good: schemas.GoodsCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create new good"""
    return crud.create_goods(db=db, goods=good, owner_id=current_user.id)

@router.put("/{good_id}", response_model=schemas.Goods)
def update_good(
    good_id: int,
    good_update: schemas.GoodsUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Update good by ID"""
    db_good = crud.get_good(db, good_id=good_id)
    if db_good is None:
        raise HTTPException(status_code=404, detail="Good not found")
    
    # Check if user owns the good or is employee/admin
    if db_good.owner_id != current_user.id and current_user.role not in ["employee", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    updated_good = crud.update_goods(db, good_id, good_update)
    return updated_good

@router.delete("/{good_id}")
def delete_good(
    good_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Delete good by ID"""
    db_good = crud.get_good(db, good_id=good_id)
    if db_good is None:
        raise HTTPException(status_code=404, detail="Good not found")
    
    # Check if user owns the good or is employee/admin
    if db_good.owner_id != current_user.id and current_user.role not in ["employee", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    crud.delete_goods(db, good_id)
    return {"message": "Good deleted successfully"}
