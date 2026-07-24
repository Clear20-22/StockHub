# ⚡ Concurrency & Database Design Guide — StockHub

This document explains the database schema architecture, multi-database support (SQLite/MongoDB), and concurrency control mechanisms implemented in **StockHub**.

---

## 📋 Table of Contents
1. [Database Models & ER Diagram](#database-models--er-diagram)
2. [Optimistic Concurrency Control (Race Condition Safety)](#optimistic-concurrency-control-race-condition-safety)
3. [Multi-Database Architecture (SQLite & MongoDB)](#multi-database-architecture-sqlite--mongodb)
4. [Database Migrations](#database-migrations)

---

## Database Models & ER Diagram

The primary relational schema is defined in [`backend/app/database.py`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/backend/app/database.py).

```text
┌─────────────────┐       1:N       ┌─────────────────┐
│     users       ├────────────────►│     goods       │
│  - id           │                 │  - id           │
│  - username     │                 │  - name         │
│  - role         │                 │  - quantity     │
│  - branch_id ───┼───┐             │  - version  ────┼───► (Optimistic Locking)
└────────┬────────┘   │             │  - branch_id ───┼───┐
         │            │             └─────────────────┘   │
         │ 1:N        │                                   │ N:1
         ▼            │ N:1                               ▼
┌─────────────────┐   │             ┌─────────────────┐   │
│  assignments    │   └────────────►│    branches     │◄──┘
│  - id           │                 │  - id           │
│  - employee_id  │                 │  - name         │
│  - branch_id ───┼────────────────►│  - capacity     │
└─────────────────┘                 └─────────────────┘
```

### Key Models

1. **User**: Represents system users (`customer`, `employee`, `admin`).
2. **Goods**: Represents storage inventory. Contains `quantity`, `price_per_unit`, `branch_id`, and `version`.
3. **Branch**: Represents physical warehouse locations with total cubic `capacity` and `available_space`.
4. **Assignment**: Represents duty tasks assigned by admins to warehouse employees.
5. **CustomerApplication**: Stores requests submitted by customers to store goods in warehouse branches.
6. **UserActivity**: Audit log tracking user logins, stock adjustments, and administrative updates.

---

## Optimistic Concurrency Control (Race Condition Safety)

### The Problem
When multiple warehouse employees update stock for the same item simultaneously, a race condition occurs:
1. Employee A reads `quantity = 10` (v1).
2. Employee B reads `quantity = 10` (v1).
3. Employee A reduces stock by 5 and saves `quantity = 5`.
4. Employee B reduces stock by 2 and saves `quantity = 8` (overwriting Employee A's deduction!).

### The Solution: Version Column Tracking
* **Schema**: [`database.py`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/backend/app/database.py#L59) (`version = Column(Integer, default=1, nullable=False)`)
* **Logic**: [`GoodsService.update_stock()`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/backend/app/services/goods_service.py#L38-L55)

```python
def update_stock(self, goods_id: int, quantity_change: int, user_id: int, expected_version: Optional[int] = None):
    item = self.get_goods_item(goods_id)
    if expected_version is not None and item.version != expected_version:
        raise ValueError(f"Concurrency error: Item version mismatch. Current: {item.version}, expected: {expected_version}")

    item.quantity += quantity_change
    item.version = (item.version or 1) + 1  # Increment version on update
    self.db.commit()
    self.db.refresh(item)
    return item
```

If an item's version changes concurrently before a write completes, an error is raised, protecting inventory data integrity.

---

## Multi-Database Architecture (SQLite & MongoDB)

StockHub supports dual database backends:
1. **SQLite (SQLAlchemy)**: Used for primary relational tables (`backend/app/database.py`).
2. **MongoDB (Motor / Beanie)**: Used for document-oriented storage (`backend/app/mongodb.py` & `mongo_models.py`).

The **Repository Factory Pattern** ([`backend/app/repositories/factory.py`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/backend/app/repositories/factory.py)) provides a dynamic interface to switch between database implementations.

---

## Database Migrations

Migration scripts are organized under [`backend/scripts/`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/backend/scripts/):
* `migrate_database.py`: Applies schema updates to SQLite.
* `migrate_to_mongodb.py`: Migrates SQLite records to MongoDB collections.
* `insert_employees.py`: Seeds initial employee accounts into the database.
