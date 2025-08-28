"""
MongoDB CRUD router for Goods collection (replaces SQLite goods)
"""
from fastapi import APIRouter, HTTPException, status
from typing import List, Optional
from bson import ObjectId
from datetime import datetime

from app.mongodb import get_database
from app.mongo_models import MongoGoods, GoodsCreate, GoodsUpdate, StockUpdate

router = APIRouter()

def get_goods_collection():
    """Get the goods collection from database"""
    db = get_database()
    return db.goods

@router.post("/", response_model=MongoGoods, status_code=status.HTTP_201_CREATED)
async def create_goods(goods_data: GoodsCreate):
    """Create new goods"""
    collection = get_goods_collection()
    
    # Convert to dict and add timestamps
    goods_dict = goods_data.dict()
    goods_dict["created_at"] = datetime.utcnow()
    goods_dict["updated_at"] = datetime.utcnow()
    goods_dict["sqlite_id"] = -1  # New goods get -1 to distinguish from migrated ones
    
    try:
        result = await collection.insert_one(goods_dict)
        created_goods = await collection.find_one({"_id": result.inserted_id})
        
        if created_goods:
            created_goods["_id"] = str(created_goods["_id"])
            return MongoGoods(**created_goods)
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create goods"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while creating goods: {str(e)}"
        )

@router.get("/")
async def get_all_goods(page: int = 1, limit: int = 10, search: str = None, category: str = None):
    """Get all goods with pagination and search"""
    collection = get_goods_collection()
    
    try:
        # Calculate skip value from page
        skip = (page - 1) * limit
        
        # Build query filter
        query_filter = {}
        if search:
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
            goods_dict["_id"] = str(goods_dict["_id"])
            goods_list.append(goods_dict)
        
        return {
            "goods": goods_list,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching goods: {str(e)}"
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
            goods["_id"] = str(goods["_id"])
            return goods
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Goods not found"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching goods: {str(e)}"
        )

@router.put("/{goods_id}")
async def update_goods(goods_id: str, goods_update: GoodsUpdate):
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
            updated_goods["_id"] = str(updated_goods["_id"])
            return updated_goods
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update goods"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while updating goods: {str(e)}"
        )

@router.delete("/{goods_id}")
async def delete_goods(goods_id: str):
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while deleting goods: {str(e)}"
        )

@router.put("/{goods_id}/stock")
async def update_stock(goods_id: str, stock_update: StockUpdate):
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
            updated_goods["_id"] = str(updated_goods["_id"])
            
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while updating stock: {str(e)}"
        )

@router.get("/category/{category}", response_model=List[MongoGoods])
async def get_goods_by_category(category: str):
    """Get goods by category"""
    collection = get_goods_collection()
    
    try:
        cursor = collection.find({"category": category})
        goods = []
        
        async for document in cursor:
            document["_id"] = str(document["_id"])
            goods.append(MongoGoods(**document))
        
        return goods
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching goods by category: {str(e)}"
        )
