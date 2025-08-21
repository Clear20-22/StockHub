import React from 'react';
import { useNavigate } from 'react-router-dom';
import ManageUsers from './ManageUsers';

const AdminUsers = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  return <ManageUsers onBack={handleBack} />;
};

export default AdminUsers;
