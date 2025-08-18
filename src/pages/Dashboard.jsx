import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminDashboard from '../admin/Dashboard';
import EmployeeDashboard from '../employee/Dashboard';
import CustomerDashboard from '../customer/Dashboard';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    case 'customer':
      return <CustomerDashboard />;
    default:
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Invalid User Role
            </h2>
            <p className="text-gray-600">
              Your account role is not recognized. Please contact support.
            </p>
          </div>
        </div>
      );
  }
};

export default Dashboard;
