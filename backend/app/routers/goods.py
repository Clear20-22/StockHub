from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app import schemas
from app.database import get_db
from app.auth_dependencies import get_current_user, require_employee_or_admin
from app.services.goods_service import GoodsService

router = APIRouter()

@router.get("/", response_model=List[schemas.Goods])
def read_goods(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all goods with optional filtering"""
    service = GoodsService(db)
    return service.list_goods(skip=skip, limit=limit)

@router.get("/my-goods", response_model=List[schemas.Goods])
def read_my_goods(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Get current user's goods"""
    service = GoodsService(db)
    return service.list_goods(skip=skip, limit=limit, owner_id=current_user.id)

@router.get("/{good_id}", response_model=schemas.Goods)
def read_good(
    good_id: int,
    db: Session = Depends(get_db)
):
    """Get good by ID"""
    service = GoodsService(db)
    return service.get_goods_item(good_id)

@router.post("/", response_model=schemas.Goods)
def create_good(
    good: schemas.GoodsCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Create new good via GoodsService"""
    service = GoodsService(db)
    return service.create_goods(goods_data=good, owner_id=current_user.id)

@router.delete("/{good_id}")
def delete_good(
    good_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_employee_or_admin)
):
    """Delete good by ID via GoodsService"""
    service = GoodsService(db)
    service.delete_goods(good_id)
    return {"message": "Good deleted successfully"}
