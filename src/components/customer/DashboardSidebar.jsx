import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, MapPin, BarChart3, Bell, Settings, Menu, User, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const DashboardSidebar = ({ collapsed, onToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard, path: '/customer/dashboard' },
    { id: 'inventory', label: 'My Inventory', icon: Package, path: '/customer/dashboard/inventory' },
    { id: 'branches', label: 'Branches', icon: MapPin, path: '/customer/dashboard/branches' },
    { id: 'statistics', label: 'Statistics', icon: BarChart3, path: '/customer/dashboard/statistics' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/customer/dashboard/notifications' },
    { id: 'account', label: 'Account', icon: Settings, path: '/customer/dashboard/account' }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout by clearing localStorage and redirecting
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
      collapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        {collapsed ? (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-gray-900">StockHub</span>
          </div>
        )}
      </div>

      {/* User Profile */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.firstName || 'Customer'} {user?.lastName || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'customer@example.com'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={collapsed ? item.label : ''}
            >
              <Icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
              {!collapsed && (
                <span className="truncate">{item.label}</span>
              )}
              {!collapsed && item.id === 'notifications' && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  2
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200 ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut className={`h-5 w-5 ${collapsed ? '' : 'mr-3'} flex-shrink-0`} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapsed State Indicators */}
      {collapsed && (
        <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2">
          <div className="w-1 h-8 bg-blue-600 rounded-full opacity-50"></div>
        </div>
      )}
    </div>
  );
};

export default DashboardSidebar;
