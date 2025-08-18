import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Package, Users, Building, ClipboardList, LogOut, User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Branches', path: '/branches' },
        { name: 'Contact', path: '/contact' },
      ];
    }

    const baseItems = [
      { name: 'Dashboard', path: '/dashboard' },
    ];

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        { name: 'Users', path: '/admin/users', icon: Users },
        { name: 'Goods', path: '/admin/goods', icon: Package },
        { name: 'Branches', path: '/admin/branches', icon: Building },
        { name: 'Assignments', path: '/admin/assignments', icon: ClipboardList },
      ];
    }

    if (user?.role === 'employee') {
      return [
        ...baseItems,
        { name: 'My Tasks', path: '/employee/assignments', icon: ClipboardList },
        { name: 'Inventory', path: '/employee/goods', icon: Package },
      ];
    }

    if (user?.role === 'customer') {
      return [
        ...baseItems,
        { name: 'My Goods', path: '/customer/goods', icon: Package },
        { name: 'Branches', path: '/branches', icon: Building },
      ];
    }

    return baseItems;
  };

  return (
    <nav className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white shadow-xl border-b border-blue-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group transition-all duration-200 hover:scale-105"
              onClick={closeMobileMenu}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <Package className="relative h-8 w-8 text-blue-100 group-hover:text-white transition-colors" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                StockHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {getNavItems().map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105 hover:shadow-lg backdrop-blur-sm"
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20">
                  <div className="relative">
                    <User className="h-5 w-5 text-blue-200" />
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-blue-700"></div>
                  </div>
                  <div className="text-sm">
                    <div className="font-semibold text-white">
                      {user?.first_name} {user?.last_name}
                    </div>
                    <div className="text-xs text-blue-200 capitalize">
                      {user?.role}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-sm font-medium text-red-100 hover:text-white transition-all duration-200 hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-red-400/20"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-white text-blue-700 rounded-xl text-sm font-bold hover:bg-blue-50 hover:text-blue-800 transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="p-2 rounded-xl text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-200 hover:scale-105 backdrop-blur-sm"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white/5 backdrop-blur-sm rounded-b-2xl border-t border-white/10 mt-2">
              {/* Mobile Navigation Items */}
              {getNavItems().map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                >
                  {item.icon && <item.icon className="h-5 w-5" />}
                  <span>{item.name}</span>
                </Link>
              ))}

              {/* Mobile User Section */}
              <div className="pt-4 border-t border-white/10">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-4 py-3 bg-white/10 rounded-xl backdrop-blur-sm">
                      <div className="relative">
                        <User className="h-6 w-6 text-blue-200" />
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full border-2 border-blue-700"></div>
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">
                          {user?.first_name} {user?.last_name}
                        </div>
                        <div className="text-xs text-blue-200 capitalize">
                          {user?.role}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-xl text-base font-medium text-red-100 hover:text-white transition-all duration-200 backdrop-blur-sm"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 rounded-xl text-base font-medium text-blue-100 hover:text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3 bg-white text-blue-700 rounded-xl text-base font-bold hover:bg-blue-50 hover:text-blue-800 transition-all duration-200 text-center"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
