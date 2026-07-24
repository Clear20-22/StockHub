# 🎨 Frontend Architecture & Hooks Guide — StockHub

This document explains the frontend component hierarchy, React Context providers, custom hooks, and route protection mechanisms in **StockHub**.

---

## 📋 Table of Contents
1. [Frontend Overview](#frontend-overview)
2. [State Management & Context Providers](#state-management--context-providers)
3. [Custom Data Hooks](#custom-data-hooks)
4. [Route Guard Protection](#route-guard-protection)
5. [API Service Layer](#api-service-layer)

---

## Frontend Overview

StockHub's frontend is a Single Page Application (SPA) built with **React 18**, **Vite**, **React Router v7**, and **Tailwind CSS**.

```text
src/
├── App.jsx                     # Top-level Router & Smooth Scroll Manager
├── main.jsx                    # Application Entry Point
├── contexts/                   # React Context Providers
│   ├── AuthContext.jsx         # User Authentication & JWT Storage
│   └── NotificationContext.jsx # Toast Alert Notification System
├── hooks/                      # Reusable Custom Data Hooks
│   ├── useGoods.js             # Inventory fetching & refresh hook
│   ├── useBranches.js          # Branch capacity & listing hook
│   └── useSmoothScroll.js      # Smooth scroll behavior hook
├── components/
│   ├── admin/
│   │   ├── AdminProtectedComponent.jsx
│   │   └── modals/             # GoodsModal, UserModal, StockUpdateModal, etc.
│   ├── common/                 # ScrollToTop, alert banners
│   ├── customer/               # Customer Dashboard Widgets
│   └── layout/                 # Navbar, Footer
└── pages/                      # Role-Specific View Containers
    ├── Home.jsx                # Public Landing Page
    ├── auth/                   # Login & Register
    ├── customer/               # StoreGoods, BranchCapacity, ApplyToStore
    ├── employee/               # CustomerApplications, Inventory, TimeTracker
    └── admin/                  # ManageUsers, ManageGoods, ManageBranches
```

---

## State Management & Context Providers

### AuthContext (`src/contexts/AuthContext.jsx`)
* **Purpose**: Manages global user authentication identity, JWT token storage (`localStorage`), login, registration, and logout operations.
* **Usage**:
```javascript
import { useAuth } from '../contexts/AuthContext';

const Component = () => {
  const { user, login, logout } = useAuth();
  return <div>Welcome, {user?.username}</div>;
};
```

### NotificationContext (`src/contexts/NotificationContext.jsx`)
* **Purpose**: Manages global toast notifications (`success`, `error`, `info`, `warning`) across all pages.

---

## Custom Data Hooks

Custom hooks in [`src/hooks/`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/src/hooks/) encapsulate asynchronous data fetching, loading states, and error handling.

### `useGoods(filters)`
```javascript
import { useGoods } from '../hooks/useGoods';

const InventoryView = () => {
  const { goods, loading, error, refresh } = useGoods();

  if (loading) return <div>Loading goods...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{goods.map(g => <p key={g.id}>{g.name}</p>)}</div>;
};
```

### `useBranches()`
```javascript
import { useBranches } from '../hooks/useBranches';

const BranchView = () => {
  const { branches, loading, error, refresh } = useBranches();
  // Renders branch capacity metrics
};
```

---

## Route Guard Protection

* **Component**: [`src/components/ProtectedRoute.jsx`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/src/components/ProtectedRoute.jsx)
* **Behavior**: Evaluates authentication status and user roles before rendering protected routes.

```jsx
<Route 
  path="/admin/manage-goods" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <ManageGoods />
    </ProtectedRoute>
  } 
/>
```

---

## API Service Layer

* **File**: [`src/services/api.js`](file:///Users/jubayerahmedsojib/Documents/GitHub/StockHub/src/services/api.js)
* **Axios Interceptors**:
  * **Request Interceptor**: Automatically attaches `Authorization: Bearer <token>` header to outgoing HTTP requests.
  * **Response Interceptor**: Automatically handles `401 Unauthorized` responses by clearing local tokens and redirecting users to `/login`.
