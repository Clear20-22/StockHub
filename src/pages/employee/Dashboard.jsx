import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  ClipboardList, 
  Package, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  AlertCircle,
  Award,
  Calendar,
  Target,
  Activity,
  MapPin,
  User,
  ArrowUpRight,
  BarChart3,
  PieChart,
  Users,
  Building2
} from 'lucide-react';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalAssignments: 0,
    pendingAssignments: 0,
    completedAssignments: 0,
    recentGoods: 0
  });

  const [assignments, setAssignments] = useState([]);
  const [recentGoods, setRecentGoods] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data - in real app, this would be API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate successful data fetch
      setStats({
        totalAssignments: 8,
        pendingAssignments: 3,
        completedAssignments: 12,
        recentGoods: 247
      });

      setAssignments([
        {
          id: 1,
          task: 'Inventory Count - Section A',
          description: 'Complete inventory count for electronics section',
          status: 'in_progress',
          priority: 'high',
          due_date: '2024-08-22'
        },
        {
          id: 2,
          task: 'Quality Check - Batch #2024-089',
          description: 'Quality inspection of incoming shipments',
          status: 'pending',
          priority: 'medium',
          due_date: '2024-08-23'
        },
        {
          id: 3,
          task: 'Shipment Preparation',
          description: 'Prepare outbound shipments for delivery',
          status: 'completed',
          priority: 'high',
          due_date: '2024-08-21'
        }
      ]);

      setRecentGoods([
        {
          id: 1,
          name: 'Samsung Galaxy S24',
          category: 'Electronics',
          quantity: 150,
          price_per_unit: 799.99
        },
        {
          id: 2,
          name: 'Apple MacBook Pro',
          category: 'Computers',
          quantity: 75,
          price_per_unit: 2499.99
        },
        {
          id: 3,
          name: 'Sony WH-1000XM5',
          category: 'Audio',
          quantity: 200,
          price_per_unit: 399.99
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      // Don't show error for now to avoid auth issues
      setStats({
        totalAssignments: 0,
        pendingAssignments: 0,
        completedAssignments: 0,
        recentGoods: 0
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const quickActions = [
    {
      title: 'View My Tasks',
      description: 'Check assigned tasks and deadlines',
      icon: ClipboardList,
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/employee/assignments')
    },
    {
      title: 'Inventory Management',
      description: 'View and update inventory items',
      icon: Package,
      color: 'from-green-500 to-green-600',
      action: () => navigate('/employee/inventory')
    },
    {
      title: 'Time Tracker',
      description: 'Log work hours and breaks',
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/employee/time-tracker')
    },
    {
      title: 'Reports',
      description: 'View performance and analytics',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      action: () => navigate('/employee/reports')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Employee Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.first_name || 'Employee'}! Here's your work overview.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Assignments"
            value={stats.totalAssignments}
            icon={ClipboardList}
            color="text-blue-600"
            description="All your tasks"
          />
          <StatCard
            title="Pending Tasks"
            value={stats.pendingAssignments}
            icon={Clock}
            color="text-orange-600"
            description="Need attention"
          />
          <StatCard
            title="Completed Tasks"
            value={stats.completedAssignments}
            icon={CheckCircle}
            color="text-green-600"
            description="Well done!"
          />
          <StatCard
            title="Goods in System"
            value={stats.recentGoods}
            icon={Package}
            color="text-purple-600"
            description="Total inventory"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 text-left group"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
              <ArrowUpRight className="h-4 w-4 text-gray-400 mt-2 group-hover:text-gray-600 transition-colors" />
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Assignments */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Assignments</h3>
              <button 
                onClick={() => navigate('/employee/assignments')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            
            {assignments.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No assignments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => (
                  <div key={assignment.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{assignment.task}</h4>
                        {assignment.description && (
                          <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                        )}
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                            {assignment.status.replace('_', ' ').charAt(0).toUpperCase() + assignment.status.slice(1)}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                            {assignment.priority} priority
                          </span>
                        </div>
                      </div>
                    </div>
                    {assignment.due_date && (
                      <div className="mt-2 text-xs text-gray-500">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Goods */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Goods</h3>
              <button 
                onClick={() => navigate('/employee/inventory')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>
            
            {recentGoods.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No goods found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentGoods.map((good) => (
                  <div key={good.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{good.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">{good.category}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Qty: {good.quantity}</span>
                          <span className="text-sm font-medium text-green-600">${good.price_per_unit}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Additional Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Additional Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => navigate('/employee/time-tracker')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 group"
            >
              <Clock className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600">Time Tracker</p>
            </button>
            <button 
              onClick={() => navigate('/employee/reports')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors duration-200 group"
            >
              <TrendingUp className="w-8 h-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-green-600">View Reports</p>
            </button>
            <button 
              onClick={() => navigate('/employee/settings')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors duration-200 group"
            >
              <User className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-purple-600">Settings</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
