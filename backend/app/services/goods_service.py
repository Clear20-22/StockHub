"""
Goods & Inventory Domain Service.
Encapsulates stock adjustments, storage validation, and branch capacity checks.
"""
from sqlalchemy.orm import Session
from typing import List, Optional
from app import crud, schemas
from app.services.exceptions import EntityNotFoundError, InsufficientCapacityError

class GoodsService:
    def __init__(self, db: Session):
        self.db = db

    def get_goods_item(self, goods_id: int):
        item = crud.get_goods_item(self.db, goods_id)
        if not item:
            raise EntityNotFoundError("Goods", goods_id)
        return item

    def list_goods(self, skip: int = 0, limit: int = 100, owner_id: Optional[int] = None, branch_id: Optional[int] = None):
        return crud.get_goods(self.db, skip=skip, limit=limit, owner_id=owner_id, branch_id=branch_id)

    def create_goods(self, goods_data: schemas.GoodsCreate, owner_id: int):
        # Verify branch capacity if allocated to a branch
        if goods_data.branch_id:
            branch = crud.get_branch(self.db, goods_data.branch_id)
            if branch:
                current_used = crud.get_branch_used_capacity(self.db, goods_data.branch_id)
                requested_volume = (goods_data.quantity or 1) * (goods_data.unit_volume or 1.0)
                if current_used + requested_volume > branch.capacity:
                    raise InsufficientCapacityError(
                        branch_name=branch.name,
                        requested=requested_volume,
                        available=max(0, branch.capacity - current_used)
                    )
        return crud.create_goods(self.db, goods_data, owner_id=owner_id)

    def update_stock(self, goods_id: int, quantity_change: int, user_id: int, expected_version: Optional[int] = None):
        item = self.get_goods_item(goods_id)
        if expected_version is not None and item.version != expected_version:
            raise ValueError(f"Concurrency error: Item version mismatch. Current version: {item.version}, expected: {expected_version}")

        new_quantity = item.quantity + quantity_change
        if new_quantity < 0:
            raise ValueError("Stock quantity cannot be negative.")
        
        item.quantity = new_quantity
        item.version = (item.version or 1) + 1
        self.db.commit()
        self.db.refresh(item)
        
        activity_type = "STOCK_INCREASE" if quantity_change > 0 else "STOCK_DECREASE"
        crud.create_user_activity(
            self.db,
            user_id=user_id,
            activity_type=activity_type,
            description=f"Adjusted stock for '{item.name}' by {quantity_change}. New total: {new_quantity} (v{item.version})"
        )
        return item

    def delete_goods(self, goods_id: int):
        item = self.get_goods_item(goods_id)
        return crud.delete_goods(self.db, goods_id)
