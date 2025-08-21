import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Package, Users, Building, ClipboardList, LogOut, User, Menu, X, TrendingUp, CheckCircle, Bell, Settings } from 'lucide-react';
import { smoothScrollToElement } from '../../utils/smoothScroll';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Handle scroll to show/hide navbar
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY < lastScrollY || currentScrollY < 100) {
        // Scrolling up or near top - show navbar
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past threshold - hide navbar
        setIsVisible(false);
        setIsMobileMenuOpen(false); // Close mobile menu when hiding
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

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

  // Handle navigation to sections
  const handleSectionNavigation = (sectionId) => {
    // If not on home page, navigate to home first then scroll
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        smoothScrollToElement(sectionId, 80, 1000);
      }, 100);
    } else {
      smoothScrollToElement(sectionId, 80, 1000);
    }
    closeMobileMenu();
  };

  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { name: 'Home', action: () => navigate('/') },
        { name: 'About', action: () => handleSectionNavigation('about') },
        { name: 'Branches', action: () => handleSectionNavigation('branches') },
        { name: 'Contact', action: () => handleSectionNavigation('contact') },
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
        { name: 'Store Goods', path: '/customer/store-goods', icon: Package },
        { name: 'Branch Capacity', path: '/customer/branch-capacity', icon: TrendingUp },
        { name: 'Apply to Store', path: '/customer/apply-to-store', icon: CheckCircle },
      ];
    }

    return baseItems;
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } bg-gradient-to-r from-blue-600/90 via-blue-700/90 to-blue-800/90 backdrop-blur-lg text-white shadow-2xl border-b border-white/20`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <div className="flex items-center py-2">
            <Link 
              to="/" 
              className="flex items-center space-x-3 group transition-all duration-300 hover:scale-105"
              onClick={closeMobileMenu}
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white to-blue-200 rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-all duration-300"></div>
                <div className="relative bg-gradient-to-br from-white/20 to-white/10 p-3 rounded-xl backdrop-blur-sm border border-white/30 group-hover:border-white/50 transition-all duration-300 shadow-lg">
                  <Package className="h-8 w-8 text-white drop-shadow-lg" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-lg">
                StockHub
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {getNavItems().map((item) => (
              item.path ? (
                <Link
                  key={item.name}
                  to={item.path}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-white/15 hover:to-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-transparent hover:border-white/20 group"
                >
                  {item.icon && <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />}
                  <span className="drop-shadow-sm">{item.name}</span>
                </Link>
              ) : (
                <button
                  key={item.name}
                  onClick={item.action}
                  className="flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-white/15 hover:to-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-transparent hover:border-white/20 group"
                >
                  {item.icon && <item.icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />}
                  <span className="drop-shadow-sm">{item.name}</span>
                </button>
              )
            ))}
          </div>

          {/* Desktop User Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* Customer additional features */}
                {user?.role === 'customer' && (
                  <div className="flex items-center space-x-2">
                    <button className="relative p-2 text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-white/15 hover:to-white/10 rounded-lg transition-all duration-200">
                      <Bell className="h-5 w-5" />
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white/50"></span>
                    </button>
                    <button 
                      onClick={() => navigate('/customer/settings')}
                      className="p-2 text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-white/15 hover:to-white/10 rounded-lg transition-all duration-200"
                    >
                      <Settings className="h-5 w-5" />
                    </button>
                  </div>
                )}
                <div className="flex items-center space-x-3 bg-gradient-to-r from-white/15 to-white/10 px-4 py-2.5 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-sm opacity-60"></div>
                    <div className="relative bg-gradient-to-br from-white/30 to-white/20 p-2 rounded-full">
                      <User className="h-5 w-5 text-white drop-shadow-sm" />
                    </div>
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white/50 shadow-lg"></div>
                  </div>
                  <div className="text-sm">
                    <div className="font-bold text-white drop-shadow-sm">
                      {user?.first_name} {user?.last_name}
                    </div>
                    <div className="text-xs text-blue-200 capitalize font-medium">
                      {user?.role}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 rounded-xl text-sm font-semibold text-red-100 hover:text-white transition-all duration-300 hover:scale-105 hover:shadow-lg backdrop-blur-sm border border-red-400/20 hover:border-red-400/30 group"
                >
                  <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                  <span className="drop-shadow-sm">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-white/15 hover:to-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-transparent hover:border-white/20 drop-shadow-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2.5 bg-gradient-to-r from-white to-blue-50 text-blue-700 rounded-xl text-sm font-bold hover:from-blue-50 hover:to-white hover:text-blue-800 transition-all duration-300 hover:scale-105 hover:shadow-xl border border-white/20 hover:border-white/40"
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
              className="p-2.5 rounded-xl text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-white/15 hover:to-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-sm border border-transparent hover:border-white/20 group"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              ) : (
                <Menu className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-4 pb-6 space-y-2 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-md rounded-b-2xl border-t border-white/10 mt-2 shadow-2xl">
              {/* Mobile Navigation Items */}
              {getNavItems().map((item) => (
                item.path ? (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-3 px-4 py-3.5 rounded-xl text-base font-semibold text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-white/15 hover:to-white/10 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/20 group"
                  >
                    {item.icon && <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />}
                    <span className="drop-shadow-sm">{item.name}</span>
                  </Link>
                ) : (
                  <button
                    key={item.name}
                    onClick={item.action}
                    className="w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl text-base font-semibold text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-white/15 hover:to-white/10 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/20 group"
                  >
                    {item.icon && <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />}
                    <span className="drop-shadow-sm">{item.name}</span>
                  </button>
                )
              ))}

              {/* Mobile User Section */}
              <div className="pt-4 border-t border-white/10">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 px-4 py-3.5 bg-gradient-to-r from-white/15 to-white/10 rounded-xl backdrop-blur-sm border border-white/20 shadow-lg">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full blur-sm opacity-60"></div>
                        <div className="relative bg-gradient-to-br from-white/30 to-white/20 p-2 rounded-full">
                          <User className="h-6 w-6 text-white drop-shadow-sm" />
                        </div>
                        <div className="absolute -top-1 -right-1 h-3 w-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-2 border-white/50 shadow-lg"></div>
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm drop-shadow-sm">
                          {user?.first_name} {user?.last_name}
                        </div>
                        <div className="text-xs text-blue-200 capitalize font-medium">
                          {user?.role}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-3 w-full px-4 py-3.5 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 rounded-xl text-base font-semibold text-red-100 hover:text-white transition-all duration-300 backdrop-blur-sm border border-red-400/20 hover:border-red-400/30 group"
                    >
                      <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                      <span className="drop-shadow-sm">Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3.5 rounded-xl text-base font-semibold text-blue-100 hover:text-white hover:bg-gradient-to-r hover:from-white/15 hover:to-white/10 transition-all duration-300 backdrop-blur-sm border border-transparent hover:border-white/20 drop-shadow-sm"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={closeMobileMenu}
                      className="block px-4 py-3.5 bg-gradient-to-r from-white to-blue-50 text-blue-700 rounded-xl text-base font-bold hover:from-blue-50 hover:to-white hover:text-blue-800 transition-all duration-300 text-center shadow-lg hover:shadow-xl border border-white/20 hover:border-white/40"
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
