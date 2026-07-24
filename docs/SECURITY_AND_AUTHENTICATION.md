# 🔒 Security & Authentication Architecture — StockHub

This document outlines the security architecture, token authentication mechanisms, role-based access controls, and data protection policies implemented in **StockHub**.

---

## 📋 Table of Contents
1. [Authentication Architecture](#authentication-architecture)
2. [Dual Token Strategy (Access & Refresh Tokens)](#dual-token-strategy-access--refresh-tokens)
3. [Password Security](#password-security)
4. [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
5. [CORS & Network Security](#cors--network-security)
6. [Security Best Practices Checklist](#security-best-practices-checklist)

---

## Authentication Architecture

StockHub uses **JSON Web Token (JWT)** stateless authentication using the `HS256` HMAC-SHA256 signature algorithm.

```text
┌──────────────┐         1. POST /api/auth/login (username, password)        ┌──────────────┐
│              ├────────────────────────────────────────────────────────────►│              │
│              │                                                             │              │
│              │         2. Returns Access Token (30m) & Refresh Token (7d) │  FastAPI     │
│   Client     │◄────────────────────────────────────────────────────────────┤  Backend     │
│ (React App)  │                                                             │              │
│              │         3. GET /api/goods (Headers: Authorization Bearer)   │              │
│              ├────────────────────────────────────────────────────────────►│              │
│              │                                                             │              │
│              │         4. POST /api/auth/refresh (Renew Access Token)      │              │
│              ├────────────────────────────────────────────────────────────►│              │
└──────────────┘                                                             └──────────────┘
```

---

## Dual Token Strategy (Access & Refresh Tokens)

* **Implementation File**: [`backend/app/auth_handler.py`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/backend/app/auth_handler.py)

### Access Token
* **Lifespan**: 30 Minutes (`ACCESS_TOKEN_EXPIRE_MINUTES = 30`)
* **Purpose**: Sent with every API request in the `Authorization: Bearer <token>` HTTP header.
* **Payload Contains**: `sub` (username), `role` (`customer` / `employee` / `admin`), `user_id`, `exp` (expiration), `type: "access"`.

### Refresh Token
* **Lifespan**: 7 Days (`REFRESH_TOKEN_EXPIRE_DAYS = 7`)
* **Purpose**: Exclusively used to request a new Access Token via `/api/auth/refresh` when the 30-minute Access Token expires.
* **Security Benefit**: Prevents user session dropouts while keeping access tokens short-lived to minimize security exposure if a token is intercepted.

```python
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=30))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")

def create_refresh_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, REFRESH_SECRET_KEY, algorithm="HS256")
```

---

## Password Security

* **Hashing Algorithm**: `bcrypt` via Passlib (`CryptContext(schemes=["bcrypt"])`).
* **Storage Policy**: Raw passwords are **never** stored or logged. Only bcrypt-salted password hashes (`hashed_password`) are persisted in the database.

```python
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

---

## Role-Based Access Control (RBAC)

StockHub enforces strict 3-tier role authorization:

| Role | Access Permissions |
| :--- | :--- |
| **Customer** | Submit storage requests, view personal stored goods, check branch capacities. |
| **Employee** | Process customer applications, audit branch inventories, log work hours, view assigned duties. |
| **Admin** | Full system control: Manage users, manage goods, provision branches, inspect activity logs. |

### Backend Dependency Enforcement
* **File**: [`backend/app/auth_dependencies.py`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/backend/app/auth_dependencies.py)

```python
require_admin = require_roles(["admin"])
require_employee_or_admin = require_roles(["employee", "admin"])

@router.delete("/{branch_id}")
def delete_branch(branch_id: int, current_user = Depends(require_admin)):
    ...
```

### Frontend Guard Protection
* **Files**: [`ProtectedRoute.jsx`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/src/components/ProtectedRoute.jsx) & [`AdminProtectedComponent.jsx`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/src/components/admin/AdminProtectedComponent.jsx)

---

## CORS & Network Security

* **File**: [`backend/app/main.py`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/backend/app/main.py#L42-L48)
* **Configuration**: Restricts Cross-Origin requests explicitly to trusted local frontend origins (`http://localhost:3000`, `http://localhost:5173`, `http://localhost:5174`).
