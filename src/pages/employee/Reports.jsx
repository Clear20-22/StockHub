import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  BarChart3,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  RefreshCw,
  CheckCircle,
  Package,
  Target,
  Award,
  Activity,
  PieChart,
  LineChart
} from 'lucide-react';

const EmployeeReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [reportData, setReportData] = useState({
    productivity: {
      current: 87,
      previous: 82,
      trend: 'up'
    },
    tasksCompleted: {
      current: 24,
      previous: 21,
      trend: 'up'
    },
    hoursWorked: {
      current: 38.5,
      previous: 40,
      trend: 'down'
    },
    efficiency: {
      current: 92,
      previous: 88,
      trend: 'up'
    }
  });

  const [weeklyData, setWeeklyData] = useState([]);
  const [taskBreakdown, setTaskBreakdown] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchReportData();
  }, [selectedPeriod]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      // Mock data - in real app, this would be API calls
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setWeeklyData([
        { day: 'Mon', hours: 8, tasks: 5, efficiency: 90 },
        { day: 'Tue', hours: 7.5, tasks: 4, efficiency: 85 },
        { day: 'Wed', hours: 8, tasks: 6, efficiency: 95 },
        { day: 'Thu', hours: 7, tasks: 3, efficiency: 88 },
        { day: 'Fri', hours: 8, tasks: 5, efficiency: 92 },
        { day: 'Sat', hours: 0, tasks: 0, efficiency: 0 },
        { day: 'Sun', hours: 0, tasks: 0, efficiency: 0 }
      ]);

      setTaskBreakdown([
        { category: 'Inventory', completed: 12, percentage: 40, color: 'bg-blue-500' },
        { category: 'Quality Control', completed: 8, percentage: 27, color: 'bg-green-500' },
        { category: 'Shipping', completed: 6, percentage: 20, color: 'bg-yellow-500' },
        { category: 'Maintenance', completed: 3, percentage: 10, color: 'bg-purple-500' },
        { category: 'Training', completed: 1, percentage: 3, color: 'bg-red-500' }
      ]);

      setRecentActivities([
        {
          id: 1,
          action: 'Completed inventory count for Section A',
          time: '2 hours ago',
          type: 'task-completed',
          icon: CheckCircle,
          color: 'text-green-600'
        },
        {
          id: 2,
          action: 'Updated stock levels for 15 items',
          time: '4 hours ago',
          type: 'inventory-update',
          icon: Package,
          color: 'text-blue-600'
        },
        {
          id: 3,
          action: 'Achieved 95% efficiency target',
          time: '1 day ago',
          type: 'achievement',
          icon: Award,
          color: 'text-yellow-600'
        },
        {
          id: 4,
          action: 'Logged 8 hours of work time',
          time: '1 day ago',
          type: 'time-log',
          icon: Clock,
          color: 'text-purple-600'
        }
      ]);

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPercentageChange = (current, previous) => {
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getTrendIcon = (trend) => {
    return trend === 'up' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Performance Reports</h1>
                <p className="text-gray-600 mt-1">Track your work performance and productivity</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
              <button
                onClick={fetchReportData}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                <Download className="mr-2 h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productivity</p>
                <p className="text-3xl font-bold text-gray-900">{reportData.productivity.current}%</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(reportData.productivity.trend)}
                  <span className={`text-sm ml-1 ${reportData.productivity.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {getPercentageChange(reportData.productivity.current, reportData.productivity.previous)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                <p className="text-3xl font-bold text-gray-900">{reportData.tasksCompleted.current}</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(reportData.tasksCompleted.trend)}
                  <span className={`text-sm ml-1 ${reportData.tasksCompleted.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    +{reportData.tasksCompleted.current - reportData.tasksCompleted.previous}
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hours Worked</p>
                <p className="text-3xl font-bold text-gray-900">{reportData.hoursWorked.current}h</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(reportData.hoursWorked.trend)}
                  <span className={`text-sm ml-1 ${reportData.hoursWorked.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {getPercentageChange(reportData.hoursWorked.current, reportData.hoursWorked.previous)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency</p>
                <p className="text-3xl font-bold text-gray-900">{reportData.efficiency.current}%</p>
                <div className="flex items-center mt-2">
                  {getTrendIcon(reportData.efficiency.trend)}
                  <span className={`text-sm ml-1 ${reportData.efficiency.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {getPercentageChange(reportData.efficiency.current, reportData.efficiency.previous)}%
                  </span>
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Weekly Performance Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Performance</h3>
            <div className="space-y-4">
              {weeklyData.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 text-sm font-medium text-gray-600">{day.day}</div>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                      <div 
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${(day.hours / 8) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{day.hours}h</div>
                    <div className="text-xs text-gray-500">{day.tasks} tasks</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Task Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Task Breakdown</h3>
            <div className="space-y-4">
              {taskBreakdown.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                    <span className="text-sm font-medium text-gray-700">{category.category}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-200 rounded-full h-2 w-24">
                      <div 
                        className={`h-2 rounded-full ${category.color}`}
                        style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8">{category.completed}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activities</h3>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className={`p-2 rounded-full bg-white ${activity.color}`}>
                  <activity.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
                <div className="text-xs text-gray-400">
                  {activity.type.replace('-', ' ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow text-left">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Detailed Analytics</h4>
                <p className="text-sm text-gray-600">View comprehensive performance analytics</p>
              </div>
            </div>
          </button>

          <button className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow text-left">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Set Goals</h4>
                <p className="text-sm text-gray-600">Define performance targets and goals</p>
              </div>
            </div>
          </button>

          <button className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow text-left">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Schedule Review</h4>
                <p className="text-sm text-gray-600">Plan performance review meetings</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeReports;
