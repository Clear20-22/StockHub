import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import './App.css'

// Import pages
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
// import CustomerDashboardLayout from './pages/customer/DashboardLayout'
// import CustomerGoods from './pages/customer/MyGoods'
import EmployeeDashboard from './pages/employee/Dashboard'
import EmployeeGoods from './pages/employee/Goods'
import EmployeeAssignments from './pages/employee/Assignments'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUsers from './pages/admin/Users'
import AdminGoods from './pages/admin/Goods'
import AdminBranches from './pages/admin/Branches'
import AdminAssignments from './pages/admin/Assignments'
import Branches from './pages/Branches'
import ProtectedRoute from './components/ProtectedRoute'

// Dashboard router component to redirect based on role
const DashboardRouter = () => {
  const { user } = useAuth();
  
  // This will be handled by ProtectedRoute, but adding fallback
  if (!user) return <Navigate to="/login" replace />;
  
  switch (user.role) {
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'employee':
      return <Navigate to="/employee/dashboard" replace />;
    // case 'customer':
    //   return <Navigate to="/customer/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/branches" element={<Branches />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } />

            {/* Customer routes */}
            {/* <Route path="/customer/dashboard/*" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboardLayout />
              </ProtectedRoute>
            } />
            <Route path="/customer/goods" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerGoods />
              </ProtectedRoute>
            } /> */}

            {/* Employee routes */}
            <Route path="/employee/dashboard" element={
              <ProtectedRoute allowedRoles={['employee', 'admin']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/employee/goods" element={
              <ProtectedRoute allowedRoles={['employee', 'admin']}>
                <EmployeeGoods />
              </ProtectedRoute>
            } />
            <Route path="/employee/assignments" element={
              <ProtectedRoute allowedRoles={['employee', 'admin']}>
                <EmployeeAssignments />
              </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminUsers />
              </ProtectedRoute>
            } />
            <Route path="/admin/goods" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminGoods />
              </ProtectedRoute>
            } />
            <Route path="/admin/branches" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminBranches />
              </ProtectedRoute>
            } />
            <Route path="/admin/assignments" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminAssignments />
              </ProtectedRoute>
            } />

            {/* 404 Not Found */}
            <Route path="*" element={
              <div className="flex items-center justify-center min-h-96">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
                  <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
                  <button 
                    onClick={() => window.history.back()}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  )
}
