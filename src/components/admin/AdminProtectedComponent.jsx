import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AdminProtectedComponent = ({ children, fallback = null }) => {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return fallback || (
      <div className="p-6 text-center text-red-600 bg-red-50 rounded-xl my-4 shadow-sm border border-red-100">
        <h3 className="font-semibold text-lg mb-1">Access Restricted</h3>
        <p className="text-sm text-red-500">You need administrator privileges to view this component.</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedComponent;
