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

// Test component with minimal imports first
const CustomerDashboardTest = () => {
  const { user } = useAuth();
  const [customerData, setCustomerData] = useState(null);
  const [stats, setStats] = useState(null);
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

    } catch (err) {
      console.error('Error fetching customer data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome back, {customerData?.username || user?.username || 'Customer'}!
          </h1>
          <p className="text-gray-600">
            Email: {customerData?.email || user?.email || 'Not available'}
          </p>
          <p className="text-gray-600">
            Role: {customerData?.role || user?.role || 'Customer'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-2">
              <Package className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Total Goods</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats?.total_goods || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-2">
              <Clock className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Active Orders</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats?.active_orders || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-6 w-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Completed Orders</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">{stats?.completed_orders || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Total Value</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">${stats?.warehouse_value || 0}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerDashboardTest;
