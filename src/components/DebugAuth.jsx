import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const DebugAuth = () => {
  const { user, token, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('=== DEBUG AUTH INFO ===');
    console.log('Current path:', location.pathname);
    console.log('User:', user);
    console.log('Token:', token);
    console.log('Loading:', loading);
    console.log('Is Authenticated:', isAuthenticated);
    console.log('User role:', user?.role);
    console.log('========================');
  }, [user, token, loading, isAuthenticated, location.pathname]);

  return (
    <div className="p-4">
      <h3>Debug Auth Component</h3>
      <p>Path: {location.pathname}</p>
      <p>Loading: {loading ? 'true' : 'false'}</p>
      <p>Authenticated: {isAuthenticated ? 'true' : 'false'}</p>
      <p>User: {user ? JSON.stringify(user) : 'null'}</p>
      <p>Token: {token ? 'exists' : 'null'}</p>
      <button 
        onClick={() => navigate('/admin/assignments')}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Go to Assignments
      </button>
    </div>
  );
};

export default DebugAuth;
