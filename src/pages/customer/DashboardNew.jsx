import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  User, 
  Settings, 
  LogOut, 
  Bell,
  Search,
  Calendar,
  Package,
  Clock,
  TrendingUp,
  Eye,
  Filter,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

const CustomerDashboardNew = () => {
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock data
  const customerData = {
    name: 'John Smith',
    email: 'john.smith@example.com',
    joinDate: '2023-03-15',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    lastLogin: '2024-08-21T09:30:00Z'
  };

  const stats = {
    totalOrders: 24,
    pendingOrders: 3,
    completedOrders: 21,
    totalSpent: 15420
  };

  const recentOrders = [
    {
      id: 'ORD-2024-001',
      items: 'Electronics Storage Package',
      date: '2024-08-20',
      status: 'Delivered',
      amount: 299.99,
      tracking: 'TRK-789456123'
    },
    {
      id: 'ORD-2024-002',
      items: 'Furniture Storage (3 months)',
      date: '2024-08-18',
      status: 'In Transit',
      amount: 599.99,
      tracking: 'TRK-456789012'
    },
    {
      id: 'ORD-2024-003',
      items: 'Document Storage Box',
      date: '2024-08-15',
      status: 'Processing',
      amount: 89.99,
      tracking: 'TRK-123456789'
    },
    {
      id: 'ORD-2024-004',
      items: 'Climate Controlled Storage',
      date: '2024-08-12',
      status: 'Delivered',
      amount: 799.99,
      tracking: 'TRK-987654321'
    },
    {
      id: 'ORD-2024-005',
      items: 'Personal Items Storage',
      date: '2024-08-10',
      status: 'Cancelled',
      amount: 149.99,
      tracking: 'TRK-555666777'
    }
  ];

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in transit': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
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

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    </div>
  );

  const StatCard = ({ title, value, icon: Icon, color, loading }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {loading ? (
            <LoadingSkeleton />
          ) : (
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text', 'bg').replace('800', '100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg lg:translate-x-0 lg:static lg:inset-0 transition-transform duration-200 ease-in-out`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">StockHub</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-8 px-4">
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
            
            <button className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors mt-8">
              <LogOut className="mr-3 h-5 w-5" />
              Logout
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 mr-2"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-semibold text-gray-800">
                Welcome back, {customerData.name}!
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
                <Bell className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src={customerData.avatar}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover border-2 border-gray-200"
                />
                <span className="text-sm font-medium text-gray-700">{customerData.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            
            {/* Profile Card */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl shadow-lg p-8 mb-8 text-white">
              <div className="flex items-center space-x-6">
                <img
                  src={customerData.avatar}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div>
                  <h3 className="text-2xl font-bold mb-2">{customerData.name}</h3>
                  <p className="text-blue-100 mb-1">{customerData.email}</p>
                  <p className="text-blue-200 text-sm">
                    Member since {formatDate(customerData.joinDate)} • Last login: {formatDate(customerData.lastLogin)}
                  </p>
                </div>
              </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Orders"
                value={loading ? '' : stats.totalOrders}
                icon={Package}
                color="text-blue-600"
                loading={loading}
              />
              <StatCard
                title="Pending Orders"
                value={loading ? '' : stats.pendingOrders}
                icon={Clock}
                color="text-yellow-600"
                loading={loading}
              />
              <StatCard
                title="Completed Orders"
                value={loading ? '' : stats.completedOrders}
                icon={TrendingUp}
                color="text-green-600"
                loading={loading}
              />
              <StatCard
                title="Total Spent"
                value={loading ? '' : `$${stats.totalSpent.toLocaleString()}`}
                icon={TrendingUp}
                color="text-purple-600"
                loading={loading}
              />
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
                  <div className="flex items-center space-x-3">
                    <button className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                    </button>
                    <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
                      View All Orders
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Items
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      // Loading skeleton rows
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-6 bg-gray-200 rounded-full animate-pulse w-16"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-6 bg-gray-200 rounded animate-pulse w-12"></div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      recentOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.id}</div>
                            <div className="text-sm text-gray-500">{order.tracking}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{order.items}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(order.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">${order.amount}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 transition-colors">
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default CustomerDashboardNew;
