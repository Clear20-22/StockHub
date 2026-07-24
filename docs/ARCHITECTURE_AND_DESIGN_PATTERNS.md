# 🏛️ Architecture & Design Patterns Guide — StockHub

This document provides a detailed breakdown of all software design patterns and architectural decisions implemented in **StockHub**.

---

## 📋 Table of Contents
1. [Overview](#overview)
2. [Backend Design Patterns](#backend-design-patterns)
   - [1. Service Layer Pattern](#1-service-layer-pattern)
   - [2. Unit of Work (UoW) Pattern](#2-unit-of-work-uow-pattern)
   - [3. Repository Factory Pattern](#3-repository-factory-pattern)
   - [4. Dependency Injection & Function Factory Pattern](#4-dependency-injection--function-factory-pattern)
   - [5. Global Exception Middleware Pattern](#5-global-exception-middleware-pattern)
3. [Frontend Design Patterns](#frontend-design-patterns)
   - [1. Custom Data Fetching Hooks Pattern](#1-custom-data-fetching-hooks-pattern)
   - [2. Context Provider Pattern](#2-context-provider-pattern)
   - [3. Guard / Protected Component Pattern](#3-guard--protected-component-pattern)
   - [4. Service Facade Pattern](#4-service-facade-pattern)

---

## Overview

StockHub implements an **Enterprise Layered Architecture** ensuring strict separation of concerns, high maintainability, and scalability across the stack.

```text
┌─────────────────────────────────────────────────────────────┐
│                   React Frontend UI                         │
│  (Pages → Custom Hooks → Context Providers → Service APIs)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST HTTP (JSON)
┌──────────────────────────────▼──────────────────────────────┐
│                    FastAPI Routers                          │
│        (Presentation Layer & Route Definitions)             │
└──────────────────────────────┬──────────────────────────────┘
                               │ Domain Calls
┌──────────────────────────────▼──────────────────────────────┐
│                    Service Layer                            │
│  (UserService, GoodsService, UnitOfWork, Domain Exceptions) │
└──────────────────────────────┬──────────────────────────────┘
                               │ DB Queries
┌──────────────────────────────▼──────────────────────────────┐
│                  Repository Factory                         │
│        (Abstract Interfaces & SqlUserRepository)            │
└──────────────────────────────┬──────────────────────────────┘
                               │ SQL / NoSQL Commands
┌──────────────────────────────▼──────────────────────────────┐
│                Database Storage Layer                       │
│              (SQLite / MongoDB Engine)                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Backend Design Patterns

### 1. Service Layer Pattern

* **File Location**: [`backend/app/services/`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/backend/app/services/) (`user_service.py`, `goods_service.py`, `exceptions.py`)
* **Why We Use It**:
  Without a Service Layer, API routers directly execute database queries and format HTTP errors. The Service Layer encapsulates business rules, domain validations, and transaction boundaries away from HTTP routers.
* **How It Works**:
  Routers instantiate a service class (e.g. `GoodsService(db)`) and call high-level domain methods. If validation fails, domain exceptions are raised.

```python
class GoodsService:
    def __init__(self, db: Session):
        self.db = db

    def update_stock(self, goods_id: int, quantity_change: int, user_id: int, expected_version: Optional[int] = None):
        item = self.get_goods_item(goods_id)
        if expected_version is not None and item.version != expected_version:
            raise ValueError(f"Concurrency error: Item version mismatch.")
        item.quantity += quantity_change
        item.version += 1
        self.db.commit()
        return item
```

---

### 2. Unit of Work (UoW) Pattern

* **File Location**: [`backend/app/unit_of_work.py`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/backend/app/unit_of_work.py)
* **Why We Use It**:
  In complex business operations (e.g. approving a storage application, creating inventory, and logging activity), committing each database query individually risks leaving the database in an inconsistent state if a step fails halfway through.
* **How It Works**:
  `SqlAlchemyUnitOfWork` acts as a context manager that manages database session lifecycles. All changes are held in memory until the block completes, automatically calling `commit()` on success or `rollback()` on failure.

```python
with SqlAlchemyUnitOfWork() as uow:
    # Multiple atomic database operations
    uow.commit()
```

---

### 3. Repository Factory Pattern

* **File Location**: [`backend/app/repositories/`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/backend/app/repositories/) (`user_repository.py`, `factory.py`)
* **Why We Use It**:
  StockHub supports both relational (SQLite) and document (MongoDB) databases. The Repository Factory abstracts database operations behind a unified interface so the core application doesn't care which database is active.
* **How It Works**:
  `RepositoryFactory.get_user_repository(db)` checks environment configuration (`DB_ENGINE`) and returns the appropriate implementation (`SqlUserRepository` or `MongoUserRepository`).

```python
class RepositoryFactory:
    @staticmethod
    def get_user_repository(db: Session, db_type: Optional[str] = None) -> AbstractUserRepository:
        engine_type = db_type or os.getenv("DB_ENGINE", "sqlite")
        if engine_type == "sqlite":
            return SqlUserRepository(db)
        return SqlUserRepository(db)
```

---

### 4. Dependency Injection & Function Factory Pattern

* **File Location**: [`backend/app/auth_dependencies.py`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/backend/app/auth_dependencies.py)
* **Why We Use It**:
  Rather than repeating JWT extraction and role checks in every router file, `require_roles(allowed_roles)` acts as a **Function Factory** generating customized FastAPI dependencies.
* **How It Works**:

```python
def require_roles(allowed_roles: list):
    """Dependency Factory producing authorization checkers on demand."""
    def role_checker(current_user = Depends(get_current_user)):
        if current_user.role not in allowed_roles:
            raise HTTPException(status_code=403, detail="Unauthorized")
        return current_user
    return role_checker

require_admin = require_roles(["admin"])
require_employee_or_admin = require_roles(["employee", "admin"])
```

---

### 5. Global Exception Middleware Pattern

* **File Location**: [`backend/app/main.py`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/backend/app/main.py#L48-L64)
* **Why We Use It**:
  Eliminates repetitive `try...except HTTPException` blocks in route controllers. Service layer classes throw domain exceptions (`EntityNotFoundError`, `InsufficientCapacityError`, `DuplicateEntityError`), and FastAPI translates them into standard HTTP status codes globally.

---

## Frontend Design Patterns

### 1. Custom Data Fetching Hooks Pattern

* **File Location**: [`src/hooks/`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/src/hooks/) (`useGoods.js`, `useBranches.js`)
* **Why We Use It**:
  Decouples React UI rendering from network requests and loading state management. Page components receive `{ data, loading, error, refresh }` in one line of code.

```javascript
export const useGoods = (filters = {}) => {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGoods = useCallback(async () => {
    try {
      setLoading(true);
      const response = await goodsAPI.getAll(filters);
      setGoods(response.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchGoods(); }, [fetchGoods]);

  return { goods, loading, error, refresh: fetchGoods };
};
```

---

### 2. Context Provider Pattern

* **File Location**: [`src/contexts/`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/src/contexts/) (`AuthContext.jsx`, `NotificationContext.jsx`)
* **Why We Use It**:
  Provides global access to user authentication identity and toast notification dispatchers throughout the component tree without prop-drilling.

---

### 3. Guard / Protected Component Pattern

* **File Location**: [`src/components/ProtectedRoute.jsx`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/src/components/ProtectedRoute.jsx) & [`AdminProtectedComponent.jsx`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/src/components/admin/AdminProtectedComponent.jsx)
* **Why We Use It**:
  Guards routes and UI elements based on authentication status and user roles (`customer`, `employee`, `admin`).

---

### 4. Service Facade Pattern

* **File Location**: [`src/services/api.js`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/src/services/api.js)
* **Why We Use It**:
  Groups API calls (`authAPI`, `usersAPI`, `goodsAPI`, `branchesAPI`) into clean service facades with automatic Axios request/response interceptors.
