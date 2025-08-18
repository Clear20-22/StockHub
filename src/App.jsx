import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ScrollToTop from './components/common/ScrollToTop'
import { useSmoothScrollOnRouteChange } from './hooks/useSmoothScroll'
import { smoothScrollToTop, smoothScrollToElement } from './utils/smoothScroll'
import './App.css'

// Import pages
import Home from './pages/Home'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import CustomerDashboard from './pages/customer/Dashboard'
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
    case 'customer':
      return <Navigate to="/customer/dashboard" replace />;
    default:
      return <Navigate to="/" replace />;
  }
};

// Component to handle smooth scrolling on route changes
const AppWithScrolling = () => {
  const location = useLocation();
  
  // Enable smooth scrolling for the entire app
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  // Handle route changes with smooth scrolling
  useEffect(() => {
    // Check if there's a hash in the URL for anchor links
    if (location.hash) {
      const elementId = location.hash.substring(1);
      // Small delay to ensure the page has rendered
      const timer = setTimeout(() => {
        smoothScrollToElement(elementId, 100, 800);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      // Smooth scroll to top on route change
      const timer = setTimeout(() => {
        smoothScrollToTop(600);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, location.hash]);

  // Add smooth scrolling to all internal links
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (target) {
        e.preventDefault();
        const elementId = target.getAttribute('href').substring(1);
        smoothScrollToElement(elementId, 100, 800);
        
        // Update URL without triggering navigation
        if (window.history.replaceState) {
          window.history.replaceState(null, null, `#${elementId}`);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col scroll-smooth">
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
          <Route path="/customer/dashboard" element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerDashboard />
            </ProtectedRoute>
          } />

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
            <div className="flex items-center justify-center min-h-96 py-20">
              <div className="text-center animate-fade-in">
                <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
                <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
                <button 
                  onClick={() => {
                    smoothScrollToTop(400);
                    setTimeout(() => window.history.back(), 500);
                  }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Go Back
                </button>
              </div>
            </div>
          } />
        </Routes>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppWithScrolling />
    </AuthProvider>
  )
}
