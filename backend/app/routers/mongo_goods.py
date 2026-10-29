"""
MongoDB CRUD router for Goods collection (replaces SQLite goods)
"""
from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
import logging
import re

from app.mongodb import get_database
from app.mongo_models import MongoGoods, GoodsCreate, GoodsUpdate, StockUpdate, CustomerGoodsRequest
from app.mongo_auth_dependencies import (
    get_current_mongo_user,
    require_mongo_employee_or_admin,
    require_mongo_roles,
    user_identity_ids,
)

logger = logging.getLogger(__name__)

# Reading requires login; changes are limited to staff
router = APIRouter(dependencies=[Depends(get_current_mongo_user)])

def get_goods_collection():
    """Get the goods collection from database"""
    db = get_database()
    return db.goods

def serialize_goods(document: dict) -> dict:
    """Convert a goods document for JSON (string ids, default status for older records)"""
    document["id"] = str(document.pop("_id"))
    document.setdefault("status", "active")
    for key, value in document.items():
        if isinstance(value, ObjectId):
            document[key] = str(value)
    return document

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_goods(goods_data: GoodsCreate, current_user = Depends(require_mongo_employee_or_admin)):
    """Create new goods"""
    collection = get_goods_collection()
    
    # A repeated product_id means the same item was submitted twice (e.g. a double click)
    if goods_data.product_id and await collection.find_one({"product_id": goods_data.product_id}):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An item with this product ID already exists"
        )
    
    # Convert to dict and add timestamps
    goods_dict = goods_data.dict()
    goods_dict["created_at"] = datetime.utcnow()
    goods_dict["updated_at"] = datetime.utcnow()
    goods_dict["sqlite_id"] = -1  # New goods get -1 to distinguish from migrated ones
    
    try:
        result = await collection.insert_one(goods_dict)
        created_goods = await collection.find_one({"_id": result.inserted_id})
        
        if created_goods:
            # Convert ObjectId to string for JSON serialization
            created_goods["id"] = str(created_goods["_id"])
            del created_goods["_id"]
            # Convert any other ObjectId fields to strings
            for key, value in created_goods.items():
                if isinstance(value, ObjectId):
                    created_goods[key] = str(value)
            return created_goods
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create goods"
            )
    except Exception:
        logger.exception("An error occurred while creating goods")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating goods"
        )

@router.get("/")
async def get_all_goods(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: str = Query(None, max_length=100),
    category: str = None,
):
    """Get all goods with pagination and search"""
    collection = get_goods_collection()
    
    try:
        # Calculate skip value from page
        skip = (page - 1) * limit
        
        # Build query filter
        query_filter = {}
        if search:
            # Match the search text literally, not as a user-supplied regular expression
            search = re.escape(search)
            query_filter["$or"] = [
                {"name": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"sku": {"$regex": search, "$options": "i"}},
                {"supplier": {"$regex": search, "$options": "i"}}
            ]
        if category:
            query_filter["category"] = category
        
        # Get total count for pagination
        total = await collection.count_documents(query_filter)
        
        # Get goods with pagination
        cursor = collection.find(query_filter).skip(skip).limit(limit).sort("created_at", -1)
        goods_list = []
        
        async for document in cursor:
            # Convert _id to id and create response dict
            goods_dict = dict(document)
            goods_dict["id"] = str(goods_dict["_id"])
            # Remove the ObjectId field completely and replace with string id
            del goods_dict["_id"]
            # Convert any other ObjectId fields to strings
            for key, value in goods_dict.items():
                if isinstance(value, ObjectId):
                    goods_dict[key] = str(value)
            goods_list.append(goods_dict)
        
        return {
            "goods": goods_list,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        }
    except Exception:
        logger.exception("An error occurred while fetching goods")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching goods"
        )

@router.get("/my-goods")
async def get_my_goods(current_user = Depends(get_current_mongo_user)):
    """Goods owned by the logged-in user (newest first)"""
    collection = get_goods_collection()
    try:
        owner_ids = user_identity_ids(current_user) + [current_user["_id"]]
        cursor = collection.find({"owner_id": {"$in": owner_ids}}).sort("created_at", -1)
        return [serialize_goods(document) async for document in cursor]
    except Exception:
        logger.exception("An error occurred while fetching your goods")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching your goods"
        )

@router.post("/my-goods", status_code=status.HTTP_201_CREATED)
async def request_storage(request: CustomerGoodsRequest, current_user = Depends(require_mongo_roles(["customer"]))):
    """A customer asks to store an item; it stays pending until staff approve it"""
    now = datetime.utcnow()
    goods_dict = {
        "name": request.name,
        "description": request.description,
        "category": request.category,
        "quantity": 1,
        "price_per_unit": request.value,
        "low_stock_threshold": 0,
        "storage_date": request.storage_date,
        "special_instructions": request.special_instructions,
        "owner_id": str(current_user["_id"]),
        "branch_id": current_user.get("branch_id"),
        "status": "pending",
        "created_at": now,
        "updated_at": now,
        "sqlite_id": -1,
    }
    try:
        result = await get_goods_collection().insert_one(goods_dict)
        created = await get_goods_collection().find_one({"_id": result.inserted_id})
        return serialize_goods(created)
    except Exception:
        logger.exception("An error occurred while saving your storage request")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while saving your storage request"
        )

@router.get("/{goods_id}")
async def get_goods_by_id(goods_id: str):
    """Get goods by ID"""
    if not ObjectId.is_valid(goods_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid goods ID format"
        )
    
    collection = get_goods_collection()
    
    try:
        goods = await collection.find_one({"_id": ObjectId(goods_id)})
        
        if goods:
            # Convert _id to id for frontend compatibility
            goods["id"] = str(goods["_id"])
            # Remove the ObjectId field completely
            del goods["_id"]
            # Convert any other ObjectId fields to strings
            for key, value in goods.items():
                if isinstance(value, ObjectId):
                    goods[key] = str(value)
            return goods
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goods not found"
            )
    except Exception:
        logger.exception("An error occurred while fetching goods")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching goods"
        )

@router.put("/{goods_id}")
async def update_goods(goods_id: str, goods_update: GoodsUpdate, current_user = Depends(require_mongo_employee_or_admin)):
    """Update goods by ID"""
    if not ObjectId.is_valid(goods_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid goods ID format"
        )
    
    collection = get_goods_collection()
    
    # Create update document, excluding None values
    update_data = {k: v for k, v in goods_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields provided for update"
        )
    
    update_data["updated_at"] = datetime.utcnow()
    
    try:
        # Check if goods exists
        existing_goods = await collection.find_one({"_id": ObjectId(goods_id)})
        if not existing_goods:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goods not found"
            )
        
        # Update the goods
        result = await collection.update_one(
            {"_id": ObjectId(goods_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 1:
            updated_goods = await collection.find_one({"_id": ObjectId(goods_id)})
            # Convert _id to id for frontend compatibility
            updated_goods["id"] = str(updated_goods["_id"])
            del updated_goods["_id"]
            # Convert any other ObjectId fields to strings
            for key, value in updated_goods.items():
                if isinstance(value, ObjectId):
                    updated_goods[key] = str(value)
            return updated_goods
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update goods"
            )
    except HTTPException:
        raise
    except Exception:
        logger.exception("An error occurred while updating goods")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating goods"
        )

@router.delete("/{goods_id}")
async def delete_goods(goods_id: str, current_user = Depends(require_mongo_employee_or_admin)):
    """Delete goods by ID"""
    if not ObjectId.is_valid(goods_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid goods ID format"
        )
    
    collection = get_goods_collection()
    
    try:
        # Check if goods exists
        existing_goods = await collection.find_one({"_id": ObjectId(goods_id)})
        if not existing_goods:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goods not found"
            )
        
        # Delete the goods
        result = await collection.delete_one({"_id": ObjectId(goods_id)})
        
        if result.deleted_count == 1:
            return {"message": "Goods deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete goods"
            )
    except HTTPException:
        raise
    except Exception:
        logger.exception("An error occurred while deleting goods")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting goods"
        )

@router.put("/{goods_id}/stock")
async def update_stock(goods_id: str, stock_update: StockUpdate, current_user = Depends(require_mongo_employee_or_admin)):
    """Update stock quantity for goods"""
    if not ObjectId.is_valid(goods_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid goods ID format"
        )
    
    collection = get_goods_collection()
    
    try:
        # Check if goods exists
        existing_goods = await collection.find_one({"_id": ObjectId(goods_id)})
        if not existing_goods:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goods not found"
            )
        
        # Validate stock operation
        current_quantity = existing_goods.get("quantity", 0)
        
        # Calculate new quantity based on update type
        if stock_update.type == "inward":
            new_quantity = current_quantity + stock_update.quantity
        elif stock_update.type == "outward":
            if stock_update.quantity > current_quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Cannot dispatch {stock_update.quantity} items. Only {current_quantity} available."
                )
            new_quantity = current_quantity - stock_update.quantity
        elif stock_update.type == "adjustment":
            new_quantity = stock_update.quantity  # For adjustments, quantity is the new total
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid stock update type. Must be 'inward', 'outward', or 'adjustment'"
            )
        
        # Ensure quantity doesn't go negative
        new_quantity = max(0, new_quantity)
        
        # Update the goods with new quantity
        update_data = {
            "quantity": new_quantity,
            "updated_at": datetime.utcnow()
        }
        
        result = await collection.update_one(
            {"_id": ObjectId(goods_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 1:
            # Get updated goods
            updated_goods = await collection.find_one({"_id": ObjectId(goods_id)})
            updated_goods["id"] = str(updated_goods["_id"])
            del updated_goods["_id"]
            # Convert any other ObjectId fields to strings
            for key, value in updated_goods.items():
                if isinstance(value, ObjectId):
                    updated_goods[key] = str(value)
            
            # Create response with stock update details
            response = {
                "message": f"Stock successfully updated for {updated_goods['name']}",
                "goods": updated_goods,
                "stock_update": {
                    "type": stock_update.type,
                    "quantity_changed": stock_update.quantity,
                    "previous_quantity": current_quantity,
                    "new_quantity": new_quantity,
                    "reason": stock_update.reason,
                    "updated_at": update_data["updated_at"].isoformat()
                }
            }
            
            return response
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update stock"
            )
            
    except HTTPException:
        raise
    except Exception:
        logger.exception("An error occurred while updating stock")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating stock"
        )

@router.get("/category/{category}")
async def get_goods_by_category(category: str):
    """Get goods by category"""
    collection = get_goods_collection()
    
    try:
        cursor = collection.find({"category": category})
        goods = []
        
        async for document in cursor:
            document["id"] = str(document["_id"])
            del document["_id"]
            # Convert any other ObjectId fields to strings
            for key, value in document.items():
                if isinstance(value, ObjectId):
                    document[key] = str(value)
            goods.append(document)
        
        return goods
    except Exception:
        logger.exception("An error occurred while fetching goods by category")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching goods by category"
        )
