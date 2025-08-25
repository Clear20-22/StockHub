"""
Pydantic models for MongoDB collections
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Annotated
from bson import ObjectId

class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic v2"""
    @classmethod
    def __get_pydantic_json_schema__(cls, _source_type, _handler):
        return {"type": "string"}

# Create a type alias for PyObjectId
ObjectIdField = Annotated[PyObjectId, Field(default_factory=PyObjectId)]

class ItemBase(BaseModel):
    """Base model for Item"""
    name: str = Field(..., description="Name of the item")
    quantity: int = Field(..., ge=0, description="Quantity in stock")
    price: float = Field(..., ge=0, description="Price per unit")

class ItemCreate(ItemBase):
    """Model for creating a new item"""
    pass

class ItemUpdate(BaseModel):
    """Model for updating an item"""
    name: Optional[str] = None
    quantity: Optional[int] = Field(None, ge=0)
    price: Optional[float] = Field(None, ge=0)

class Item(ItemBase):
    """Full Item model with ID"""
    id: str = Field(alias="_id")
    
    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_encoders={ObjectId: str},
        json_schema_extra={
            "example": {
                "name": "Widget A",
                "quantity": 100,
                "price": 29.99
            }
        }
    )
