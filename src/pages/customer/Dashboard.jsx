import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package,
  Clock,
  CheckCircle,
  TrendingUp,
  Eye,
  Filter,
  ChevronRight,
  LogOut,
  User
} from 'lucide-react';
import { goodsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const statusLabels = {
  pending: 'Pending approval',
  active: 'Active',
  rejected: 'Rejected',
  released: 'Released'
};

// The API sends UTC timestamps without a zone suffix; read them as UTC, not local time
const parseDate = (value) => {
  if (typeof value === 'string' && /T\d{2}:\d{2}/.test(value) && !/(Z|[+-]\d{2}:?\d{2})$/.test(value)) {
    return new Date(`${value}Z`);
  }
  return new Date(value);
};

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [customerGoods, setCustomerGoods] = useState([]);
  const [goodsLoading, setGoodsLoading] = useState(true);
  const loading = goodsLoading;

  // Profile details come from the logged-in user
  const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ');
  const displayName = fullName || user?.username || 'Customer';
  const initials = (fullName
    ? fullName.split(' ').map(part => part[0]).join('')
    : (user?.username || 'C').slice(0, 2)
  ).slice(0, 2).toUpperCase();
  // previous_login is the login before this session; fall back to the current one
  const lastLogin = user?.previous_login || user?.last_login;

  // Fetch customer goods from backend
  useEffect(() => {
    const fetchCustomerGoods = async () => {
      try {
        setGoodsLoading(true);
        if (user) {
          const response = await goodsAPI.getMyGoods();
          const goodsData = Array.isArray(response.data) ? response.data : [];

          // Shape goods for the table; customer requests are stored as quantity 1 at the declared value
          const formattedGoods = goodsData.map((good) => ({
            id: good.id,
            displayId: good.product_id || good.sku || `GOOD-${String(good.id).slice(-6).toUpperCase()}`,
            items: good.name || 'Storage Item',
            date: good.created_at,
            status: (good.status || 'active').toLowerCase(),
            amount: (Number(good.price_per_unit) || 0) * (Number(good.quantity) || 0),
            description: good.description,
            category: good.category
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
  }, [user]);

  const stats = {
    totalGoods: customerGoods.length,
    activeGoods: customerGoods.filter(good => good.status === 'active').length,
    pendingGoods: customerGoods.filter(good => good.status === 'pending').length,
    totalValue: customerGoods.reduce((sum, good) => sum + good.amount, 0)
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'released': return 'bg-blue-100 text-blue-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return parseDate(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
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
              {title === 'Total Value'
                ? `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : value}
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
      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 mt-20">{/* Add margin-top to account for fixed navbar */}
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Customer Profile Card - Positioned below navbar */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-purple-700 px-8 py-6">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-8">
                <div className="relative">
                  {/* Initials avatar */}
                  <div
                    className="h-24 w-24 md:h-32 md:w-32 rounded-full bg-white bg-opacity-20 border-4 border-white shadow-lg flex items-center justify-center text-3xl md:text-4xl font-bold text-white"
                    aria-label="Profile"
                  >
                    {initials}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-white">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    Welcome back, {displayName}!
                  </h1>
                  <p className="text-blue-100 text-lg mb-4">{user?.email || 'No email on file'}</p>
                  <div className="flex flex-col sm:flex-row gap-4 text-sm">
                    <div className="flex items-center justify-center md:justify-start text-blue-100">
                      <User className="h-4 w-4 mr-2" />
                      <span className="font-medium">Member since:</span>
                      <span className="ml-2 bg-white bg-opacity-20 text-white px-3 py-1 rounded-full">
                        {formatDate(user?.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-center md:justify-start text-blue-100">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="font-medium">Last login:</span>
                      <span className="ml-2 bg-white bg-opacity-20 text-white px-3 py-1 rounded-full">
                        {lastLogin ? formatDate(lastLogin) : 'First login'}
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
                          <div className="text-sm font-semibold text-gray-900">{good.displayId}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">{good.items}</div>
                          {good.category && (
                            <div className="text-xs text-blue-600 mt-1">{good.category}</div>
                          )}
                          {good.description && (
                            <div className="text-xs text-gray-500 mt-1">{good.description}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{formatDate(good.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(good.status)}`}>
                            {statusLabels[good.status] || good.status}
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
                          <button
                            onClick={() => navigate('/customer/store-goods')}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                          >
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
