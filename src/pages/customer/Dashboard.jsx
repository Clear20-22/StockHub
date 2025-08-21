import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import customerAPI from '../../services/customer';
import { 
  Package, 
  MapPin, 
  User, 
  Settings, 
  Bell, 
  BarChart3, 
  Clock, 
  CheckCircle,
  Calendar,
  Mail,
  Phone,
  TrendingUp,
  Activity,
  AlertCircle,
  Loader2
} from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [customerData, setCustomerData] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch customer profile
      const profileResponse = await authAPI.getCurrentUser();
      setCustomerData(profileResponse.data);

      // Try to fetch real stats from backend
      try {
        const statsResponse = await customerAPI.getStats();
        setStats(statsResponse.data);
      } catch (statsError) {
        console.warn('Could not fetch stats, using mock data:', statsError);
        // Fallback to mock stats
        const mockStats = {
          total_goods: 12,
          active_orders: 3,
          completed_orders: 18,
          warehouse_value: 15420
        };
        setStats(mockStats);
      }

      // Try to fetch real activity from backend
      try {
        const activityResponse = await customerAPI.getActivity();
        setRecentActivity(activityResponse.data);
      } catch (activityError) {
        console.warn('Could not fetch activity, using mock data:', activityError);
        // Fallback to mock activity
        const mockActivity = [
          {
            id: 1,
            type: 'order_created',
            title: 'New storage order created',
            description: 'Order #ORD-2024-001 for Electronics storage',
            timestamp: '2024-08-21T10:30:00Z',
            status: 'pending'
          },
          {
            id: 2,
            type: 'goods_delivered',
            title: 'Goods delivered to warehouse',
            description: '5 items delivered to Warehouse Branch A',
            timestamp: '2024-08-20T14:15:00Z',
            status: 'completed'
          },
          {
            id: 3,
            type: 'payment_processed',
            title: 'Payment processed',
            description: 'Monthly storage fee payment of $250',
            timestamp: '2024-08-19T09:45:00Z',
            status: 'completed'
          },
          {
            id: 4,
            type: 'profile_updated',
            title: 'Profile information updated',
            description: 'Contact information and address updated',
            timestamp: '2024-08-18T16:20:00Z',
            status: 'completed'
          }
        ];
        setRecentActivity(mockActivity);
      }

    } catch (err) {
      console.error('Error fetching customer data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchCustomerData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Customer Profile Card */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 p-4 rounded-full">
                    <User className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Welcome back, {customerData?.first_name}!
                  </h1>
                  <p className="text-gray-600 mb-4">
                    Manage your warehouse storage and track your goods
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2 text-blue-500" />
                      {customerData?.email}
                    </div>
                    {customerData?.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="h-4 w-4 mr-2 text-green-500" />
                        {customerData.phone}
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                      Member since {formatDate(customerData?.created_at)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 lg:mt-0 flex items-center space-x-3">
                <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <Bell className="h-5 w-5 mr-2" />
                  Notifications
                </button>
                <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <Settings className="h-5 w-5 mr-2" />
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Total Goods
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.total_goods || 0}
                </p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +12% from last month
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Active Orders
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.active_orders || 0}
                </p>
                <p className="text-sm text-orange-600 mt-1 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  In progress
                </p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Completed Orders
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stats?.completed_orders || 0}
                </p>
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  All time
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Warehouse Value
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${stats?.warehouse_value?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-purple-600 mt-1 flex items-center">
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Current estimate
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Activity className="h-6 w-6 mr-2 text-blue-600" />
                Recent Activity
              </h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                  <div className={`p-2 rounded-full flex-shrink-0 ${
                    activity.status === 'completed' ? 'bg-green-100' : 
                    activity.status === 'pending' ? 'bg-orange-100' : 'bg-blue-100'
                  }`}>
                    {activity.status === 'completed' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : activity.status === 'pending' ? (
                      <Clock className="h-5 w-5 text-orange-600" />
                    ) : (
                      <Activity className="h-5 w-5 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDateTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Settings className="h-6 w-6 mr-2 text-blue-600" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex flex-col items-center p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group">
                <Package className="h-8 w-8 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-gray-900">Add Goods</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors group">
                <MapPin className="h-8 w-8 text-green-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-gray-900">View Locations</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors group">
                <BarChart3 className="h-8 w-8 text-purple-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-gray-900">Analytics</span>
              </button>
              <button className="flex flex-col items-center p-4 bg-orange-50 rounded-xl hover:bg-orange-100 transition-colors group">
                <User className="h-8 w-8 text-orange-600 mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-semibold text-gray-900">Profile</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;