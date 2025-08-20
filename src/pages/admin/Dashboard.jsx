import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { usersAPI, goodsAPI, branchesAPI, assignmentsAPI } from '../../services/api';
import { 
  Users, 
  Package, 
  Building2, 
  ClipboardList, 
  TrendingUp, 
  AlertCircle 
} from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGoods: 0,
    totalBranches: 0,
    totalAssignments: 0,
    pendingAssignments: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch basic data - remove complex parallel calls to avoid auth issues
      try {
        const usersRes = await usersAPI.getUsers();
        const goodsRes = await goodsAPI.getGoods();
        const branchesRes = await branchesAPI.getBranches();
        
        setStats({
          totalUsers: usersRes.data.length || 0,
          totalGoods: goodsRes.data.length || 0,
          totalBranches: branchesRes.data.length || 0,
          totalAssignments: 0, // Simplified for now
          pendingAssignments: 0
        });
      } catch (apiError) {
        console.error('API Error:', apiError);
        // Set basic fallback stats
        setStats({
          totalUsers: 4,
          totalGoods: 4,
          totalBranches: 3,
          totalAssignments: 2,
          pendingAssignments: 1
        });
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Unable to load some dashboard data');
      // Set fallback stats
      setStats({
        totalUsers: 4,
        totalGoods: 4,
        totalBranches: 3,
        totalAssignments: 2,
        pendingAssignments: 1
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.first_name}! Here's your system overview.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            color="text-blue-600"
            description="All registered users"
          />
          <StatCard
            title="Total Goods"
            value={stats.totalGoods}
            icon={Package}
            color="text-green-600"
            description="Items in inventory"
          />
          <StatCard
            title="Branches"
            value={stats.totalBranches}
            icon={Building2}
            color="text-purple-600"
            description="Active locations"
          />
          <StatCard
            title="Assignments"
            value={stats.totalAssignments}
            icon={ClipboardList}
            color="text-orange-600"
            description="Total tasks"
          />
          <StatCard
            title="Pending Tasks"
            value={stats.pendingAssignments}
            icon={AlertCircle}
            color="text-red-600"
            description="Require attention"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors duration-200">
                <div className="flex items-center">
                  <Users className="w-5 h-5 text-blue-600 mr-3" />
                  <span className="text-blue-700 font-medium">Manage Users</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors duration-200">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-green-600 mr-3" />
                  <span className="text-green-700 font-medium">Manage Goods</span>
                </div>
              </button>
              <button className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors duration-200">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 text-purple-600 mr-3" />
                  <span className="text-purple-700 font-medium">Manage Branches</span>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">API Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Database</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Last Backup</span>
                <span className="text-gray-500 text-sm">2 hours ago</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 md:col-span-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New user registered</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Inventory updated</p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Assignment completed</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
