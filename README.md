# 📦 StockHub — Enterprise Warehouse & Storage Management System

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18+-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3+-38B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB.svg?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**StockHub** is an enterprise-grade Warehouse Management and Customer Storage Application designed for high performance, concurrency safety, and scalable role-based warehouse operations.

---

## 🌟 Key Features

### 👤 1. Customer Portal
* **Storage Requests**: Submit warehouse storage space applications (`ApplyToStore`).
* **Inventory Tracking**: Monitor personal stored items and stock levels in real time.
* **Capacity Monitoring**: Inspect warehouse branch capacity across locations (`BranchCapacity`).
* **Profile & Settings**: Manage account information and notification preferences.

### 👷 2. Employee Workspace
* **Application Processing**: Review, approve, or reject customer storage applications (`CustomerApplications`).
* **Work Duty Assignments**: Track assigned storage and retrieval tasks (`Assignments`).
* **Branch Inventory Audits**: Inspect real-time stock levels, log time trackers, and generate reports (`Inventory`, `TimeTracker`, `Reports`).

### 👑 3. Admin Control Center
* **Full Inventory CRUD**: Manage items, bulk import inventory, and perform manual stock updates (`ManageGoods`).
* **Branch Management**: Provision warehouse locations, monitor available cubic capacity, and set managers (`ManageBranches`).
* **User & Role Administration**: Manage system accounts and inspect detailed user activity logs (`ManageUsers`).

---

## 🏛️ System Architecture & Design Patterns

StockHub is built using production-grade software design patterns:

* **Domain Service Layer Pattern**: Decouples API route controllers from database queries using dedicated domain services (`UserService`, `GoodsService`).
* **Unit of Work (UoW) Pattern**: Manages database sessions to guarantee atomic multi-table transactions.
* **Repository Factory Pattern**: Abstracts storage implementations (`AbstractUserRepository`, `SqlUserRepository`), unifying dual-database operations (SQLite / MongoDB).
* **Dependency Injection Auth Dependencies**: Centralizes JWT token extraction and role-based access control (`require_admin`, `require_employee_or_admin`).
* **Refresh Token Rotation**: Implements dual-token security (30-min Access Tokens + 7-Day Refresh Tokens with `/api/auth/refresh`).
* **Optimistic Concurrency Locking**: Prevents race conditions during simultaneous stock updates using automatic ORM `version` tracking.
* **Custom React Data Hooks**: Decouples UI rendering from asynchronous network operations (`useGoods`, `useBranches`).

---

## 🛠️ Technology Stack

* **Frontend**: React 18, Vite, React Router v7, Tailwind CSS, Lucide Icons, Framer Motion, Axios.
* **Backend**: Python FastAPI, Uvicorn ASGI, SQLAlchemy ORM, Pydantic v2, Passlib (bcrypt), PyJWT/Jose.
* **Databases**: SQLite (primary relational database) and MongoDB support (via Motor/Beanie).

---

## 📁 Project Directory Structure

```text
StockHub/
├── docs/                             # Documentation & Presentation Slides
│   ├── About Project.key
│   └── website-screenshots/
│
├── backend/                          # FastAPI Enterprise Backend
│   ├── app/
│   │   ├── services/                 # Domain Services (UserService, GoodsService)
│   │   ├── repositories/             # Repository Factory Pattern
│   │   ├── auth_dependencies.py      # Dependency Injection Auth & Roles
│   │   ├── unit_of_work.py           # Unit of Work Transaction Manager
│   │   ├── auth_handler.py           # Access & Refresh JWT Handlers
│   │   ├── database.py               # SQLAlchemy ORM Models (with Optimistic Locking)
│   │   ├── crud.py                   # Data Access Methods
│   │   ├── schemas.py                # Pydantic Schemas
│   │   ├── main.py                   # FastAPI Application & Exception Middleware
│   │   └── routers/                  # REST API Endpoints
│   ├── scripts/                      # DB Migration & Data Seeding Scripts
│   ├── tests/                        # Backend API Test Suites
│   ├── start_server.py               # Backend Launcher
│   ├── requirements.txt              # Python Dependencies
│   └── stockhub.db                   # Primary SQLite Database
│
└── src/                              # React Frontend
    ├── assets/                       # Static Assets
    ├── components/
    │   ├── admin/                    # Admin Components & Modals
    │   ├── common/                   # Shared UI Elements
    │   ├── customer/                 # Customer Components
    │   └── layout/                   # Navbar & Footer
    ├── contexts/                     # Auth & Notification Context Providers
    ├── hooks/                        # Custom Data Hooks (useGoods, useBranches)
    ├── pages/                        # Application Route Views
    ├── services/                     # Axios API Services
    ├── App.jsx                       # Routing & Main App Container
    └── main.jsx                      # Application Entry Point
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js** (v18.0 or higher)
* **Python** (v3.10 or higher)

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd backend

# Create a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI backend server
python start_server.py
```

The backend server will run on `http://localhost:8000`. You can inspect the interactive OpenAPI documentation at **`http://localhost:8000/docs`**.

---

### 2. Frontend Setup

```bash
# From the root directory, install Node dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend application will run on `http://localhost:5173`.

---

## 🔑 Default API Endpoints Overview

| Method | Endpoint | Description | Role Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register new user account | Public |
| `POST` | `/api/auth/login` | Login and receive Access + Refresh tokens | Public |
| `POST` | `/api/auth/refresh` | Renew access token using refresh token | Public |
| `GET` | `/api/goods/` | List all inventory goods | Authenticated |
| `POST` | `/api/goods/` | Add new storage item | Customer / Admin |
| `GET` | `/api/branches/` | List warehouse branches & capacity | Public / Authenticated |
| `POST` | `/api/branches/` | Provision new branch location | Admin |
| `GET` | `/api/users/` | List system users | Admin |

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
