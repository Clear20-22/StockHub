import React, { useState, useEffect } from 'react';
import { 
  Package,
  Clock,
  CheckCircle,
  TrendingUp,
  Eye,
  Filter,
  ChevronRight,
  Bell,
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { authAPI, goodsAPI } from '../../services/api';

const CustomerDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({
    name: 'John Smith',
    email: 'john.smith@example.com'
  });
  const [customerGoods, setCustomerGoods] = useState([]);
  const [goodsLoading, setGoodsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Customer data with API fetched info
  const customerData = {
    name: userInfo.name,
    email: userInfo.email,
    joinDate: '2023-03-15',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    lastLogin: '2024-08-21T09:30:00Z'
  };

  // Fetch username and email from backend
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await authAPI.getCurrentUser();
          const userData = response.data;
          
          setUserInfo({
            name: userData.username || 'Customer',
            email: userData.email || 'customer@stockhub.com'
          });
        }
      } catch (error) {
        console.warn('Failed to fetch user info, using default data:', error);
        // Keep default mock data if API fails
      }
    };

    fetchUserInfo();
  }, []);

  // Fetch customer goods from backend
  useEffect(() => {
    const fetchCustomerGoods = async () => {
      try {
        setGoodsLoading(true);
        const token = localStorage.getItem('token');
        if (token) {
          const response = await goodsAPI.getMyGoods();
          const goodsData = response.data;
          
          // Convert goods to orders format for display
          const formattedGoods = goodsData.map((good, index) => ({
            id: `GOOD-${String(good.id).padStart(3, '0')}`,
            items: good.name || 'Storage Item',
            date: good.created_at || new Date().toISOString(),
            status: good.status || 'Active',
            amount: good.value || 0,
            description: good.description || 'No description',
            category: good.category || 'General',
            branch: good.branch || 'Main Warehouse'
          }));
          
          setCustomerGoods(formattedGoods);
        }
      } catch (error) {
        console.warn('Failed to fetch customer goods:', error);
        setCustomerGoods([]); // Set empty array if API fails
      } finally {
        setGoodsLoading(false);
      }
    };

    fetchCustomerGoods();
  }, []);

  // Mock stats data with real goods count
  const stats = {
    totalGoods: customerGoods.length,
    activeGoods: customerGoods.filter(good => good.status?.toLowerCase() === 'active').length,
    pendingGoods: customerGoods.filter(good => good.status?.toLowerCase() === 'pending').length,
    totalValue: customerGoods.reduce((sum, good) => sum + (good.amount || 0), 0)
  };

  useEffect(() => {
    // Set loading to false when both user info and goods are loaded
    if (!goodsLoading) {
      const timer = setTimeout(() => setLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [goodsLoading]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'stored': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in transit': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'removed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleStoreGoods = () => {
    // Navigate to store goods page or open modal
    alert('Store Goods functionality - Navigate to goods storage form');
  };

  const handleBranchCapacity = () => {
    // Navigate to branch capacity page or show capacity info
    alert('Branch Capacity functionality - Show available warehouse space');
  };

  const handleApplyToStore = () => {
    // Navigate to application form or open modal
    alert('Apply to Store functionality - Open storage application form');
  };

  const handleDashboard = () => {
    // Navigate to dashboard or refresh current view
    window.location.reload();
  };

  const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          {loading ? (
            <div className="h-8 bg-gray-200 rounded animate-pulse w-16"></div>
          ) : (
            <p className={`text-3xl font-bold ${color}`}>
              {title === 'Total Spent' ? `$${value.toLocaleString()}` : value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text', 'bg').replace('800', '100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navbar */}
      <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">StockHub</h1>
              </div>
              <div className="hidden md:block ml-10">
                <button 
                  onClick={handleDashboard}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                >
                  <User className="mr-2 h-4 w-4" />
                  Dashboard
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-3 flex-1 justify-center">
              <button 
                onClick={handleStoreGoods}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-sm"
              >
                <Package className="mr-2 h-4 w-4" />
                Store Goods
              </button>
              <button 
                onClick={handleBranchCapacity}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 shadow-sm"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Branch Capacity
              </button>
              <button 
                onClick={handleApplyToStore}
                className="flex items-center px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors duration-200 shadow-sm"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Apply to Store
              </button>
            </div>

            {/* Mobile Action Menu */}
            <div className="md:hidden relative">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <Package className="h-6 w-6" />
              </button>
              
              {/* Mobile Dropdown Menu */}
              {mobileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <button 
                    onClick={() => { handleStoreGoods(); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <Package className="mr-2 h-4 w-4" />
                    Store Goods
                  </button>
                  <button 
                    onClick={() => { handleBranchCapacity(); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Branch Capacity
                  </button>
                  <button 
                    onClick={() => { handleApplyToStore(); setMobileMenuOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Apply to Store
                  </button>
                </div>
              )}
            </div>

            {/* Right side - Profile and Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <Bell className="h-6 w-6" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white"></span>
              </button>

              {/* Settings */}
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
                <Settings className="h-6 w-6" />
              </button>

              {/* Profile Dropdown */}
              <div className="relative flex items-center space-x-3 bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
                <img
                  src={customerData.avatar}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover border-2 border-blue-200"
                />
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{customerData.name}</p>
                  <p className="text-xs text-gray-500">Customer</p>
                </div>
              </div>

              {/* Logout */}
              <button 
                onClick={handleLogout}
                className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                title="Logout"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Customer Profile Card - Positioned below navbar */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 px-8 py-6">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
                <div className="relative">
                  <img
                    src={customerData.avatar}
                    alt="Profile"
                    className="h-24 w-24 md:h-32 md:w-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-white">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Welcome back, {customerData.name}!
                  </h1>
                  <p className="text-blue-100 text-lg mb-4">{customerData.email}</p>
                  <div className="flex flex-col sm:flex-row gap-4 text-sm">
                    <div className="flex items-center justify-center md:justify-start text-blue-100">
                      <User className="h-4 w-4 mr-2" />
                      <span className="font-medium">Member since:</span>
                      <span className="ml-2 bg-white bg-opacity-20 text-white px-3 py-1 rounded-full">
                        {formatDate(customerData.joinDate)}
                      </span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start text-blue-100">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="font-medium">Last login:</span>
                      <span className="ml-2 bg-white bg-opacity-20 text-white px-3 py-1 rounded-full">
                        {formatDate(customerData.lastLogin)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Goods"
              value={stats.totalGoods}
              icon={Package}
              color="text-blue-600"
              loading={loading}
            />
            <StatCard
              title="Active Goods"
              value={stats.activeGoods}
              icon={CheckCircle}
              color="text-green-600"
              loading={loading}
            />
            <StatCard
              title="Pending Goods"
              value={stats.pendingGoods}
              icon={Clock}
              color="text-orange-600"
              loading={loading}
            />
            <StatCard
              title="Total Value"
              value={stats.totalValue}
              icon={TrendingUp}
              color="text-purple-600"
              loading={loading}
            />
          </div>

          {/* Customer Goods Table */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Table Header */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
                <h2 className="text-2xl font-bold text-gray-900">My Goods</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter Goods
                  </button>
                  <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200">
                    View All Goods
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Table Content */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Good ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Date Added
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading || goodsLoading ? (
                    // Loading skeleton rows
                    Array.from({ length: 4 }).map((_, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-40"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-6 bg-gray-200 rounded-full animate-pulse w-20"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="h-8 bg-gray-200 rounded animate-pulse w-8"></div>
                        </td>
                      </tr>
                    ))
                  ) : customerGoods.length > 0 ? (
                    customerGoods.map((good) => (
                      <tr key={good.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{good.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">{good.items}</div>
                          {good.description && (
                            <div className="text-xs text-gray-500 mt-1">{good.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{formatDate(good.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(good.status)}`}>
                            {good.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {good.amount > 0 ? `$${good.amount.toFixed(2)}` : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50">
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    // Empty state when no goods found
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <Package className="h-16 w-16 text-gray-300 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No goods found</h3>
                          <p className="text-gray-500 mb-6 max-w-sm">
                            You haven't stored any goods yet. Start by adding your first item to our warehouse.
                          </p>
                          <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200">
                            <Package className="mr-2 h-4 w-4" />
                            Add Your First Good
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
