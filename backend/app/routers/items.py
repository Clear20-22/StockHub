"""
Items router for CRUD operations with MongoDB
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from bson import ObjectId
from pymongo.errors import DuplicateKeyError
import logging

from app.mongodb import get_database
from app.models import Item, ItemCreate, ItemUpdate
from app.mongo_auth_dependencies import get_current_mongo_user, require_mongo_employee_or_admin

logger = logging.getLogger(__name__)

# Reading requires login; changes are limited to staff
router = APIRouter(dependencies=[Depends(get_current_mongo_user)])

def get_items_collection():
    """Get the items collection from database"""
    db = get_database()
    return db.items

@router.post("/", response_model=Item, status_code=status.HTTP_201_CREATED)
async def create_item(item_data: ItemCreate, current_user = Depends(require_mongo_employee_or_admin)):
    """Create a new item"""
    collection = get_items_collection()
    
    # Convert to dict and insert
    item_dict = item_data.dict()
    
    try:
        result = await collection.insert_one(item_dict)
        created_item = await collection.find_one({"_id": result.inserted_id})
        
        if created_item:
            # Convert ObjectId to string for JSON serialization
            created_item["_id"] = str(created_item["_id"])
            return Item(**created_item)
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create item"
            )
    except DuplicateKeyError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Item with this name already exists"
        )
    except Exception:
        logger.exception("An error occurred while creating the item")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while creating the item"
        )

@router.get("/", response_model=List[Item])
async def get_all_items():
    """Get all items"""
    collection = get_items_collection()
    
    try:
        cursor = collection.find({})
        items = []
        
        async for document in cursor:
            # Convert ObjectId to string for JSON serialization
            document["_id"] = str(document["_id"])
            items.append(Item(**document))
        
        return items
    except Exception:
        logger.exception("An error occurred while fetching items")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching items"
        )

@router.get("/{item_id}", response_model=Item)
async def get_item_by_id(item_id: str):
    """Get an item by ID"""
    if not ObjectId.is_valid(item_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item ID format"
        )
    
    collection = get_items_collection()
    
    try:
        item = await collection.find_one({"_id": ObjectId(item_id)})
        
        if item:
            # Convert ObjectId to string for JSON serialization
            item["_id"] = str(item["_id"])
            return Item(**item)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
    except HTTPException:
        raise
    except Exception:
        logger.exception("An error occurred while fetching the item")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while fetching the item"
        )

@router.put("/{item_id}", response_model=Item)
async def update_item(item_id: str, item_update: ItemUpdate, current_user = Depends(require_mongo_employee_or_admin)):
    """Update an item by ID"""
    if not ObjectId.is_valid(item_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item ID format"
        )
    
    collection = get_items_collection()
    
    # Create update document, excluding None values
    update_data = {k: v for k, v in item_update.dict().items() if v is not None}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields provided for update"
        )
    
    try:
        # Check if item exists
        existing_item = await collection.find_one({"_id": ObjectId(item_id)})
        if not existing_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
        
        # Update the item
        result = await collection.update_one(
            {"_id": ObjectId(item_id)},
            {"$set": update_data}
        )
        
        if result.modified_count == 1:
            updated_item = await collection.find_one({"_id": ObjectId(item_id)})
            # Convert ObjectId to string for JSON serialization
            updated_item["_id"] = str(updated_item["_id"])
            return Item(**updated_item)
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update item"
            )
    except HTTPException:
        raise
    except Exception:
        logger.exception("An error occurred while updating the item")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while updating the item"
        )

@router.delete("/{item_id}")
async def delete_item(item_id: str, current_user = Depends(require_mongo_employee_or_admin)):
    """Delete an item by ID"""
    if not ObjectId.is_valid(item_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid item ID format"
        )
    
    collection = get_items_collection()
    
    try:
        # Check if item exists
        existing_item = await collection.find_one({"_id": ObjectId(item_id)})
        if not existing_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
        
        # Delete the item
        result = await collection.delete_one({"_id": ObjectId(item_id)})
        
        if result.deleted_count == 1:
            return {"message": "Item deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete item"
            )
    except HTTPException:
        raise
    except Exception:
        logger.exception("An error occurred while deleting the item")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while deleting the item"
        )
