import React from 'react';
import { Package, MapPin, Clock, TrendingUp, Plus, Search, Filter, ExternalLink } from 'lucide-react';

const OverviewSection = ({ data }) => {
  const MetricCard = ({ title, value, change, icon: Icon, color, description }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className={`text-sm mt-2 flex items-center ${
              change.startsWith('+') ? 'text-green-600' : 'text-red-600'
            }`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {change} from last month
            </p>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`w-16 h-16 bg-${color}-100 rounded-xl flex items-center justify-center`}>
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
        activity.status === 'completed' ? 'bg-green-100' :
        activity.status === 'pending' ? 'bg-yellow-100' :
        activity.status === 'in-progress' ? 'bg-blue-100' : 'bg-gray-100'
      }`}>
        <Package className={`h-5 w-5 ${
          activity.status === 'completed' ? 'text-green-600' :
          activity.status === 'pending' ? 'text-yellow-600' :
          activity.status === 'in-progress' ? 'text-blue-600' : 'text-gray-600'
        }`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{activity.action}</p>
        <p className="text-sm text-gray-500">{activity.branch} • {activity.date}</p>
      </div>
      <div className={`px-2 py-1 text-xs font-medium rounded-full ${
        activity.status === 'completed' ? 'bg-green-100 text-green-800' :
        activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
        activity.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {activity.status}
      </div>
    </div>
  );

  const QuickActionButton = ({ title, description, icon: Icon, color, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 border-dashed border-${color}-200 hover:border-${color}-300 hover:bg-${color}-50 transition-all duration-200 group`}
    >
      <div className="flex flex-col items-center text-center space-y-2">
        <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center group-hover:bg-${color}-200 transition-colors`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div>
          <p className={`text-sm font-medium text-${color}-700`}>{title}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </button>
  );

  const defaultData = {
    metrics: {
      totalGoods: 127,
      activeBranches: 4,
      pendingActions: 3,
      storageUsage: 78.5
    },
    recentActivity: [
      { id: 1, action: 'Stored MacBook Pro', branch: 'New York Branch', date: '2025-08-19', status: 'completed' },
      { id: 2, action: 'Retrieved Office Chair', branch: 'LA Branch', date: '2025-08-18', status: 'completed' },
      { id: 3, action: 'Storage Request', branch: 'Chicago Branch', date: '2025-08-17', status: 'pending' },
      { id: 4, action: 'Stored iPhone 15', branch: 'New York Branch', date: '2025-08-16', status: 'completed' },
    ]
  };

  const displayData = data || defaultData;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-xl p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold mb-2">Welcome to StockHub</h1>
            <p className="text-blue-100 text-lg">
              Manage your storage efficiently with our comprehensive dashboard
            </p>
            <div className="flex items-center space-x-4 mt-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-sm text-blue-100">All systems operational</span>
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Package className="h-16 w-16 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Goods"
          value={displayData.metrics.totalGoods}
          change="+12.5%"
          icon={Package}
          color="blue"
          description="Items currently in storage"
        />
        <MetricCard
          title="Active Branches"
          value={displayData.metrics.activeBranches}
          change="+1"
          icon={MapPin}
          color="green"
          description="Storage locations available"
        />
        <MetricCard
          title="Pending Actions"
          value={displayData.metrics.pendingActions}
          change="-2"
          icon={Clock}
          color="yellow"
          description="Requires your attention"
        />
        <MetricCard
          title="Storage Usage"
          value={`${displayData.metrics.storageUsage}%`}
          change="+5.2%"
          icon={TrendingUp}
          color="purple"
          description="Of allocated space"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1">
                <span>View all</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-2">
              {displayData.recentActivity.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            <p className="text-sm text-gray-500 mt-1">Common tasks and shortcuts</p>
          </div>
          <div className="p-6 space-y-4">
            <QuickActionButton
              title="Store New Item"
              description="Add items to storage"
              icon={Plus}
              color="blue"
              onClick={() => console.log('Store new item')}
            />
            <QuickActionButton
              title="Find My Goods"
              description="Search stored items"
              icon={Search}
              color="green"
              onClick={() => console.log('Find goods')}
            />
            <QuickActionButton
              title="Schedule Pickup"
              description="Arrange item retrieval"
              icon={Clock}
              color="purple"
              onClick={() => console.log('Schedule pickup')}
            />
            <QuickActionButton
              title="Browse Branches"
              description="View all locations"
              icon={MapPin}
              color="orange"
              onClick={() => console.log('Browse branches')}
            />
          </div>
        </div>
      </div>

      {/* Storage Usage Details */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Storage Overview</h2>
          <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Manage Storage
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 relative">
              <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-blue-600"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={`${displayData.metrics.storageUsage}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-gray-900">{displayData.metrics.storageUsage}%</span>
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900">Space Used</h3>
            <p className="text-sm text-gray-500">Of allocated storage</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{displayData.metrics.totalGoods}</div>
            <h3 className="text-lg font-medium text-gray-900">Items Stored</h3>
            <p className="text-sm text-gray-500">Across all branches</p>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{displayData.metrics.activeBranches}</div>
            <h3 className="text-lg font-medium text-gray-900">Active Locations</h3>
            <p className="text-sm text-gray-500">Storage facilities</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;
