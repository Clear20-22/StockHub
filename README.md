# StockHub - Warehouse Management System

## Overview
StockHub is a complete warehouse management system web application built with React (frontend), FastAPI (backend), and SQLite (database). It provides role-based access control for administrators, employees, and customers with comprehensive CRUD operations for managing goods, branches, and assignments.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Admin, Employee, Customer)
- Secure password hashing with bcrypt
- Demo credentials for testing

### 👥 User Roles

#### Admin Dashboard
- Manage users, goods, branches, and assignments
- View system analytics and reports
- Full CRUD operations on all entities
- User role management

#### Employee Dashboard
- Manage assigned goods
- View and update assignments
- Access to branch-specific data
- Task management

#### Customer Dashboard
- View personal goods/orders
- Track assignment status
- Basic profile management

### 🏗️ Technical Stack

#### Frontend
- **React 19.1.0** with modern hooks
- **React Router 7.6.3** for navigation
- **Axios** for API communication
- **Lucide React** for icons
- **TailwindCSS** for styling (ready for implementation)
- **Framer Motion** for animations (ready for implementation)

#### Backend
- **FastAPI 0.115.14** for REST API
- **SQLAlchemy 2.0.41** for ORM
- **SQLite** for database
- **JWT (python-jose)** for authentication
- **Passlib** with bcrypt for password hashing
- **Pydantic 2.11.7** for data validation

### 🚀 Getting Started

#### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

#### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd StockHub
   ```

2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Seed the database with demo data
   cd app
   python seed_data.py
   
   # Start the backend server
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Frontend Setup**
   ```bash
   # In a new terminal, from the project root
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API Documentation: http://localhost:8000/docs
   - Backend API: http://localhost:8000

### 🔑 Demo Credentials

#### Admin User
- Username: `admin`
- Password: `admin123`

#### Employee User
- Username: `employee1`
- Password: `employee123`

#### Customer User
- Username: `customer1`
- Password: `customer123`

### 📁 Project Structure

```
StockHub/
├── backend/
│   ├── app/
│   │   ├── routers/          # API route handlers
│   │   ├── models/           # SQLAlchemy models (in database.py)
│   │   ├── schemas.py        # Pydantic schemas
│   │   ├── crud.py          # Database operations
│   │   ├── auth_handler.py  # JWT handling
│   │   ├── database.py      # Database configuration
│   │   ├── main.py          # FastAPI app configuration
│   │   └── seed_data.py     # Database seeding script
│   ├── requirements.txt
│   └── venv/
├── src/
│   ├── components/
│   │   ├── layout/          # Navbar, Footer components
│   │   └── ProtectedRoute.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx  # Authentication context
│   ├── pages/
│   │   ├── auth/            # Login, Register pages
│   │   ├── admin/           # Admin dashboard and features
│   │   ├── employee/        # Employee dashboard and features
│   │   ├── customer/        # Customer dashboard and features
│   │   └── Dashboard.jsx    # Role-based dashboard router
│   ├── services/
│   │   └── api.js           # API service layer
│   └── utils/
├── package.json
└── README.md
```

### 🌟 API Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

#### Users (Admin only)
- `GET /users/` - List all users
- `GET /users/{user_id}` - Get user by ID
- `PUT /users/{user_id}` - Update user
- `DELETE /users/{user_id}` - Delete user

#### Goods
- `GET /goods/` - List goods (filtered by role)
- `POST /goods/` - Create new goods (Admin/Employee)
- `PUT /goods/{goods_id}` - Update goods
- `DELETE /goods/{goods_id}` - Delete goods

#### Branches
- `GET /branches/` - List branches
- `POST /branches/` - Create branch (Admin only)
- `PUT /branches/{branch_id}` - Update branch
- `DELETE /branches/{branch_id}` - Delete branch

#### Assignments
- `GET /assignments/` - List assignments (filtered by role)
- `POST /assignments/` - Create assignment (Admin/Employee)
- `PUT /assignments/{assignment_id}` - Update assignment
- `DELETE /assignments/{assignment_id}` - Delete assignment

### 🔧 Development Notes

#### Backend
- All API endpoints include proper authentication and authorization
- Database models include relationships and constraints
- CORS enabled for frontend development
- Comprehensive error handling and validation
- Automatic API documentation with Swagger/OpenAPI

#### Frontend
- Context-based state management for authentication
- Role-based route protection
- Responsive design with modern CSS
- Modular component architecture
- API service layer for backend communication

### 🚧 Next Steps

1. **UI/UX Enhancement**
   - Implement TailwindCSS styling
   - Add Framer Motion animations
   - Create responsive layouts

2. **Advanced Features**
   - Real-time notifications
   - Advanced search and filtering
   - Data analytics and reporting
   - File upload capabilities
   - Email notifications

3. **Performance Optimization**
   - Implement pagination
   - Add caching strategies
   - Optimize database queries
   - Add loading states

4. **Testing**
   - Unit tests for backend
   - Integration tests for API
   - Frontend component testing
   - End-to-end testing

### 📄 License
This project is licensed under the MIT License.

### 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

**StockHub** - Streamlining warehouse management with modern web technologies.+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
