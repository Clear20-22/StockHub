import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import WarehouseDashboard from './pages/customer/Dashboard'
import GeneralDashboard from './pages/general/Dashboard'

export default function App() {
  return (
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Navigate to="/general-dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<WarehouseDashboard />} />
          <Route path="/general-dashboard" element={<GeneralDashboard />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>
  )
}
