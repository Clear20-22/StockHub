# StockHub Development Guidelines
## Complete Full-Stack Feature Development Workflow
### React + FastAPI + MongoDB Atlas

This document provides a **complete process** for adding new features to the StockHub application, ensuring consistency, maintainability, and best practices across the full-stack architecture.

---

## 📋 **1. Frontend (React) - Files to Modify**

When adding a new feature, you typically modify these files **in this order**:

### **Step 1.1: Data Models & Types** (Optional but Recommended)
```
src/types/
├── product.js          # TypeScript-like prop definitions
└── api.js             # API response type definitions
```

### **Step 1.2: API Service Layer** 
```
src/services/
└── api.js             # Add new API endpoints
```

### **Step 1.3: UI Components**
```
src/components/
├── common/
│   └── ProductCard.jsx    # Reusable components
└── admin/
    ├── ProductModal.jsx   # Feature-specific modals
    └── ProductForm.jsx    # Form components
```

### **Step 1.4: Pages/Views**
```
src/pages/
└── admin/
    └── ManageProducts.jsx # Main page component
```

### **Step 1.5: State Management** (if needed)
```
src/contexts/
└── ProductContext.jsx    # Global state for products
```

### **Step 1.6: Routing**
```
src/App.jsx              # Add new routes
```

---

## 📋 **2. Backend (FastAPI) - Files to Modify**

### **Step 2.1: Data Models**
```
backend/app/
├── mongo_models.py      # Pydantic models for MongoDB
└── schemas.py           # SQLite schemas (if still using)
```

### **Step 2.2: Database Connection**
```
backend/app/
└── mongodb.py           # MongoDB connection setup
```

### **Step 2.3: Route Handlers**
```
backend/app/routers/
├── products.py          # New router for products
└── __init__.py         # Import new router
```

### **Step 2.4: Main Application**
```
backend/app/
└── main.py             # Include new router
```

### **Step 2.5: Dependencies & Auth**
```
backend/app/
├── auth_handler.py     # If auth changes needed
└── database.py         # If SQLite still used
```

---

## 📋 **3. MongoDB Atlas - Schema & Collections**

### **Step 3.1: Collection Design**
- Plan your document structure
- Define indexes for performance
- Consider relationships between collections

### **Step 3.2: Database Operations**
- MongoDB operations are handled in the router files
- No separate migration files needed (unlike SQL)
- Indexes can be created programmatically or via Atlas UI

---

## 🔧 **4. Concrete Example: "Add Product" Feature**

### **4.1 Frontend Changes**

#### **A. Update API Service** (`src/services/api.js`)
```javascript
// Add to existing api.js
export const productsAPI = {
  getProducts: (params = {}) => api.get('/api/mongo/products', { params }),
  getProduct: (id) => api.get(`/api/mongo/products/${id}`),
  createProduct: (data) => api.post('/api/mongo/products', data),
  updateProduct: (id, data) => api.put(`/api/mongo/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/api/mongo/products/${id}`),
  updateStock: (id, stock) => api.put(`/api/mongo/products/${id}/stock`, { stock }),
};
```

#### **B. Create Product Modal** (`src/components/admin/ProductModal.jsx`)
```javascript
import React, { useState } from 'react';
import { productsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

const ProductModal = ({ product, onClose, onSave }) => {
  const { success, error } = useNotification();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || '',
    stock_quantity: product?.stock_quantity || 0,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (product) {
        await productsAPI.updateProduct(product.id, formData);
        success('Product updated successfully!');
      } else {
        await productsAPI.createProduct(formData);
        success('Product created successfully!');
      }
      onSave(); // This triggers parent to refresh the list
      onClose();
    } catch (err) {
      error('Failed to save product: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full">
        <h2 className="text-xl font-bold mb-4">
          {product ? 'Edit Product' : 'Add Product'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Price</label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Stock Quantity</label>
            <input
              type="number"
              value={formData.stock_quantity}
              onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value)})}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
```

#### **C. Create Main Products Page** (`src/pages/admin/ManageProducts.jsx`)
```javascript
import React, { useState, useEffect } from 'react';
import { productsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import ProductModal from '../../components/admin/ProductModal';

const ManageProducts = () => {
  const { success, error } = useNotification();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getProducts();
      setProducts(response.data); // MongoDB returns sorted data
    } catch (err) {
      error('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleProductSaved = () => {
    fetchProducts(); // Refresh list after save
    setShowModal(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Products</h1>
        <button
          onClick={handleAddProduct}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Product
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          {products.map(product => (
            <div key={product.id} className="border p-4 rounded">
              <h3 className="font-bold">{product.name}</h3>
              <p>Price: ${product.price}</p>
              <p>Stock: {product.stock_quantity}</p>
              <button
                onClick={() => handleEditProduct(product)}
                className="bg-yellow-500 text-white px-3 py-1 rounded mt-2"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setShowModal(false)}
          onSave={handleProductSaved}
        />
      )}
    </div>
  );
};

export default ManageProducts;
```

### **4.2 Backend Changes**

#### **A. Create MongoDB Models** (`backend/app/mongo_models.py`)
```python
# Add to existing mongo_models.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class MongoProduct(BaseModel):
    id: Optional[str] = Field(alias="_id")
    name: str
    description: Optional[str] = None
    price: float
    category: str
    stock_quantity: int = 0
    is_active: bool = True
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[str] = None  # User ID who created it

    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category: str
    stock_quantity: int = 0

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    category: Optional[str] = None
    stock_quantity: Optional[int] = None
    is_active: Optional[bool] = None

class ProductResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    price: float
    category: str
    stock_quantity: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    created_by: Optional[str]
```

#### **B. Create Products Router** (`backend/app/routers/products.py`)
```python
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from app.mongodb import get_database
from app.mongo_models import ProductCreate, ProductUpdate, ProductResponse
from app.routers.mongo_auth import require_admin, get_current_user_from_token

router = APIRouter()

def get_products_collection():
    """Get products collection from MongoDB"""
    db = get_database()
    return db.products

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    current_user = Depends(get_current_user_from_token)
):
    """Get all products - sorted by creation time descending"""
    collection = get_products_collection()
    
    # Build filter
    filter_dict = {"is_active": True}
    if category:
        filter_dict["category"] = category
    
    try:
        # Fetch products sorted by created_at descending (newest first)
        cursor = collection.find(filter_dict).sort("created_at", -1).skip(skip).limit(limit)
        products = await cursor.to_list(length=limit)
        
        # Convert to response format
        product_list = []
        for product in products:
            product_data = {
                "id": str(product["_id"]),
                "name": product["name"],
                "description": product.get("description"),
                "price": product["price"],
                "category": product["category"],
                "stock_quantity": product["stock_quantity"],
                "is_active": product["is_active"],
                "created_at": product["created_at"],
                "updated_at": product.get("updated_at"),
                "created_by": product.get("created_by")
            }
            product_list.append(ProductResponse(**product_data))
        
        return product_list
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch products: {str(e)}"
        )

@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    current_user = Depends(require_admin)
):
    """Create new product (admin only)"""
    collection = get_products_collection()
    
    # Create product document
    product_doc = {
        "name": product_data.name,
        "description": product_data.description,
        "price": product_data.price,
        "category": product_data.category,
        "stock_quantity": product_data.stock_quantity,
        "is_active": True,
        "created_at": datetime.utcnow(),
        "created_by": str(current_user["_id"])
    }
    
    try:
        # Insert into MongoDB
        result = await collection.insert_one(product_doc)
        
        # Get created product
        created_product = await collection.find_one({"_id": result.inserted_id})
        
        # Return response
        response_data = {
            "id": str(created_product["_id"]),
            "name": created_product["name"],
            "description": created_product.get("description"),
            "price": created_product["price"],
            "category": created_product["category"],
            "stock_quantity": created_product["stock_quantity"],
            "is_active": created_product["is_active"],
            "created_at": created_product["created_at"],
            "updated_at": created_product.get("updated_at"),
            "created_by": created_product.get("created_by")
        }
        
        return ProductResponse(**response_data)
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create product: {str(e)}"
        )

@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: str,
    product_update: ProductUpdate,
    current_user = Depends(require_admin)
):
    """Update product (admin only)"""
    collection = get_products_collection()
    
    try:
        # Check if product exists
        existing_product = await collection.find_one({"_id": ObjectId(product_id)})
        if not existing_product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        # Prepare update data
        update_data = product_update.dict(exclude_unset=True)
        update_data["updated_at"] = datetime.utcnow()
        
        # Update in MongoDB
        await collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": update_data}
        )
        
        # Get updated product
        updated_product = await collection.find_one({"_id": ObjectId(product_id)})
        
        # Return response
        response_data = {
            "id": str(updated_product["_id"]),
            "name": updated_product["name"],
            "description": updated_product.get("description"),
            "price": updated_product["price"],
            "category": updated_product["category"],
            "stock_quantity": updated_product["stock_quantity"],
            "is_active": updated_product["is_active"],
            "created_at": updated_product["created_at"],
            "updated_at": updated_product.get("updated_at"),
            "created_by": updated_product.get("created_by")
        }
        
        return ProductResponse(**response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update product: {str(e)}"
        )

@router.delete("/{product_id}")
async def delete_product(
    product_id: str,
    current_user = Depends(require_admin)
):
    """Delete product (admin only)"""
    collection = get_products_collection()
    
    try:
        # Soft delete - mark as inactive
        result = await collection.update_one(
            {"_id": ObjectId(product_id)},
            {"$set": {"is_active": False, "updated_at": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )
        
        return {"message": "Product deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete product: {str(e)}"
        )
```

#### **C. Update Main App** (`backend/app/main.py`)
```python
# Add to existing imports
from app.routers import products

# Add to router includes
app.include_router(products.router, prefix="/api/mongo/products", tags=["MongoDB Products"])
```

### **4.3 MongoDB Schema Design**

#### **Collection Structure** (MongoDB Atlas)
```javascript
// products collection
{
  _id: ObjectId("..."),
  name: "iPhone 15 Pro",
  description: "Latest Apple smartphone with A17 Pro chip",
  price: 999.99,
  category: "Electronics",
  stock_quantity: 50,
  is_active: true,
  created_at: ISODate("2025-08-26T10:30:00Z"),
  updated_at: ISODate("2025-08-26T11:00:00Z"),
  created_by: "64f123abc456def789012345" // User ObjectId
}
```

#### **Indexes to Create** (MongoDB Atlas UI or programmatically)
```javascript
// In MongoDB Atlas
db.products.createIndex({ "created_at": -1 })  // For sorting newest first
db.products.createIndex({ "category": 1 })     // For category filtering
db.products.createIndex({ "name": "text" })    // For text search
db.products.createIndex({ "is_active": 1 })    // For active/inactive filtering
```

---

## 🔄 **5. Data Flow Explanation**

### **Complete Request-Response Cycle:**

```
1. USER ACTION (React)
   └── User clicks "Add Product" button in ManageProducts.jsx

2. FRONTEND STATE UPDATE
   └── setShowModal(true) opens ProductModal.jsx

3. USER FORM SUBMISSION
   └── User fills form, clicks "Save"
   └── handleSubmit() in ProductModal.jsx

4. API REQUEST (Frontend → Backend)
   └── productsAPI.createProduct(formData)
   └── POST /api/mongo/products with JSON payload
   └── Authorization: Bearer {jwt_token}

5. FASTAPI ROUTE HANDLER (Backend)
   └── @router.post("/") in products.py receives request
   └── Validates JWT token via require_admin dependency
   └── Extracts user info from token

6. MONGODB OPERATION
   └── get_products_collection() gets DB connection
   └── collection.insert_one(product_doc) inserts document
   └── MongoDB returns inserted document with _id

7. BACKEND RESPONSE
   └── Converts MongoDB document to ProductResponse
   └── Returns JSON with 201 status code

8. FRONTEND RESPONSE HANDLING
   └── Success → onSave() callback triggered
   └── onSave() calls fetchProducts() in parent component
   └── fetchProducts() calls productsAPI.getProducts()

9. REFRESH REQUEST (Frontend → Backend)
   └── GET /api/mongo/products
   └── MongoDB query with .sort("created_at", -1)
   └── Returns all products, newest first

10. FRONTEND STATE UPDATE
    └── setProducts(response.data) updates state
    └── React re-renders with new product at top of list
    └── setShowModal(false) closes modal
    └── Success notification displays
```

---

## 🎯 **6. Best Practices & Guidelines**

### **6.1 Code Organization**

#### **Frontend Structure**
```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── forms/           # Form-specific components
│   └── modals/          # Modal components
├── pages/               # Route-based page components
├── services/
│   ├── api.js           # Centralized API calls
│   └── utils.js         # Helper functions
├── contexts/            # Global state management
├── hooks/               # Custom React hooks
└── constants/           # Configuration constants
```

#### **Backend Structure**
```
backend/app/
├── routers/             # Route handlers (one per feature)
├── models/              # Data models
├── services/            # Business logic
├── utils/               # Helper functions
├── middleware/          # Custom middleware
└── config/              # Configuration
```

### **6.2 Error Handling Strategy**

#### **Frontend Error Handling**
```javascript
// In components
const handleSubmit = async () => {
  try {
    setLoading(true);
    await productsAPI.createProduct(formData);
    success('Product created!');
    onSave(); // Refresh data
  } catch (error) {
    // Handle specific error types
    if (error.response?.status === 400) {
      error('Invalid product data');
    } else if (error.response?.status === 401) {
      error('Unauthorized access');
      // Redirect to login
    } else {
      error('Something went wrong. Please try again.');
    }
    console.error('Error:', error);
  } finally {
    setLoading(false);
  }
};

// Global error handler in api.js
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

#### **Backend Error Handling**
```python
# In route handlers
try:
    result = await collection.insert_one(product_doc)
    return ProductResponse(**response_data)
except DuplicateKeyError:
    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Product with this name already exists"
    )
except Exception as e:
    logger.error(f"Failed to create product: {str(e)}")
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Internal server error"
    )
```

### **6.3 Data Refresh Strategy**

#### **Automatic Refresh Pattern**
```javascript
// Parent component (ManageProducts.jsx)
const handleProductSaved = async () => {
  await fetchProducts(); // Re-fetch from server
  setShowModal(false);   // Close modal
  success('Product saved successfully!');
};

// Pass callback to child components
<ProductModal onSave={handleProductSaved} />
```

#### **Optimistic Updates** (Advanced)
```javascript
// Update UI immediately, rollback if error
const handleDelete = async (productId) => {
  // Optimistically remove from UI
  setProducts(prev => prev.filter(p => p.id !== productId));
  
  try {
    await productsAPI.deleteProduct(productId);
    success('Product deleted');
  } catch (error) {
    // Rollback on error
    await fetchProducts();
    error('Failed to delete product');
  }
};
```

### **6.4 Preventing Breaking Changes**

#### **API Versioning**
```python
# Version your API routes
app.include_router(products.router, prefix="/api/v1/products")
app.include_router(products_v2.router, prefix="/api/v2/products")
```

#### **Database Migrations**
```python
# For MongoDB, handle missing fields gracefully
user_data = {
    "username": user["username"],
    "email": user["email"],
    "role": user.get("role", "customer"),  # Default for old docs
    "created_at": user.get("created_at", datetime.utcnow()),
    # ... handle other fields
}
```

#### **Backwards Compatibility**
```javascript
// Frontend: Handle API changes gracefully
const product = {
  id: data.id || data._id,           // Handle both formats
  name: data.name || data.title,     // Handle field name changes
  price: data.price || 0,            // Provide defaults
};
```

### **6.5 Testing Strategy**

#### **Frontend Testing**
```javascript
// Test API calls
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { productsAPI } from '../services/api';

jest.mock('../services/api');

test('creates product successfully', async () => {
  productsAPI.createProduct.mockResolvedValue({ data: { id: '1', name: 'Test' } });
  
  render(<ProductModal onSave={mockOnSave} />);
  
  fireEvent.change(screen.getByLabelText('Product Name'), { 
    target: { value: 'Test Product' } 
  });
  fireEvent.click(screen.getByText('Save'));
  
  await waitFor(() => {
    expect(productsAPI.createProduct).toHaveBeenCalled();
    expect(mockOnSave).toHaveBeenCalled();
  });
});
```

#### **Backend Testing**
```python
# test_products.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_product():
    response = client.post(
        "/api/mongo/products",
        json={"name": "Test Product", "price": 99.99, "category": "Test"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Test Product"
```

---

## 📚 **7. Complete Workflow Checklist**

### **For Every New Feature:**

#### **☑️ Planning Phase**
- [ ] Define the feature requirements
- [ ] Design the data structure (MongoDB schema)
- [ ] Plan the API endpoints needed
- [ ] Sketch the UI components

#### **☑️ Backend Implementation**
- [ ] Create Pydantic models in `mongo_models.py`
- [ ] Create router file in `routers/feature_name.py`
- [ ] Add CRUD operations with proper error handling
- [ ] Add authentication/authorization as needed
- [ ] Include router in `main.py`
- [ ] Test endpoints with FastAPI docs (`/docs`)

#### **☑️ Frontend Implementation**
- [ ] Add API functions to `services/api.js`
- [ ] Create modal/form components for data entry
- [ ] Create main page component for data display
- [ ] Implement proper error handling
- [ ] Add loading states and user feedback
- [ ] Test the complete flow

#### **☑️ Integration & Testing**
- [ ] Test create → refresh flow works
- [ ] Verify data sorting (newest first)
- [ ] Check error handling for network failures
- [ ] Test authentication/authorization
- [ ] Verify no existing features are broken

#### **☑️ Production Readiness**
- [ ] Add proper logging
- [ ] Optimize database queries/indexes
- [ ] Add input validation
- [ ] Handle edge cases
- [ ] Write tests (unit + integration)

---

## 🚀 **8. StockHub Specific Conventions**

### **8.1 Authentication Flow**
- All admin operations require JWT token with `role: "admin"`
- Use `require_admin` dependency in FastAPI routes
- Frontend stores token in localStorage
- Auto-redirect to login on 401 errors

### **8.2 MongoDB Collections**
- `users` - User accounts and profiles
- `products` - Product inventory
- `branches` - Branch locations
- `assignments` - User-branch assignments
- `user_activities` - Activity logging

### **8.3 API Endpoint Patterns**
- MongoDB endpoints: `/api/mongo/{collection}`
- SQLite endpoints: `/api/{collection}` (legacy)
- Admin-only endpoints: `/api/mongo/{collection}/admin/*`

### **8.4 Frontend Component Patterns**
- Modal components for create/edit operations
- Main page components for list/grid views
- Centralized API calls in `services/api.js`
- Global state in Context providers
- Notifications via `useNotification` hook

---

This workflow ensures **consistent, scalable, and maintainable** feature development across your StockHub application. Each new feature follows the same pattern, making your codebase predictable and easy to work with.

## 📝 **Document History**
- Created: August 26, 2025
- Last Updated: August 26, 2025
- Version: 1.0
- Project: StockHub Full-Stack Application
