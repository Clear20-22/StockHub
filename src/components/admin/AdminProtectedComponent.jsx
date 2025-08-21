import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, AlertTriangle } from 'lucide-react';

const AdminProtectedComponent = ({ children, requiredPermission = 'admin' }) => {
  const { user } = useAuth();

  // Check if user has required permission
  const hasPermission = () => {
    if (!user) return false;
    
    switch (requiredPermission) {
      case 'admin':
        return user.role === 'admin';
      case 'admin_or_employee':
        return ['admin', 'employee'].includes(user.role);
      case 'user_management':
        return user.role === 'admin'; // Only admins can manage users
      case 'goods_management':
        return ['admin', 'employee'].includes(user.role);
      case 'branch_management':
        return user.role === 'admin';
      default:
        return false;
    }
  };

  if (!hasPermission()) {
    return (
      <div className="min-h-screen py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this feature.
            </p>
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Shield className="w-4 h-4 mr-2" />
              Required permission: {requiredPermission}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminProtectedComponent;
