import React from 'react';
import { BarChart3, TrendingUp, PieChart, Activity } from 'lucide-react';

const StatisticsSection = ({ data, expanded = false }) => {
  // Simple bar chart component using CSS
  const SimpleBarChart = ({ data, title }) => {
    const maxValue = Math.max(...data.map(item => Math.max(item.stored, item.retrieved)));
    
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{item.month}</span>
                <div className="flex space-x-4">
                  <span className="text-blue-600">Stored: {item.stored}</span>
                  <span className="text-green-600">Retrieved: {item.retrieved}</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(item.stored / maxValue) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(item.retrieved / maxValue) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple pie chart using CSS
  const SimplePieChart = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-32 h-32">
            {/* Simple circular progress bars */}
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-gray-200"
                stroke="currentColor"
                strokeWidth="3"
                fill="transparent"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {data.map((item, index) => {
                const percentage = (item.value / total) * 100;
                const circumference = 2 * Math.PI * 15.9155;
                const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                
                return (
                  <path
                    key={index}
                    stroke={item.color}
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray={strokeDasharray}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    className="transition-all duration-1000"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900">{total}</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium text-gray-900">{item.value}</span>
                <span className="text-xs text-gray-500 ml-1">
                  ({Math.round((item.value / total) * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          <p className={`text-sm mt-1 ${change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
            {change} from last period
          </p>
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const defaultData = {
    inventoryTrends: [
      { month: 'Jan', stored: 45, retrieved: 23 },
      { month: 'Feb', stored: 52, retrieved: 28 },
      { month: 'Mar', stored: 48, retrieved: 31 },
      { month: 'Apr', stored: 61, retrieved: 25 },
      { month: 'May', stored: 55, retrieved: 35 },
      { month: 'Jun', stored: 67, retrieved: 42 }
    ],
    branchUsage: [
      { name: 'New York', value: 35, color: '#3B82F6' },
      { name: 'Los Angeles', value: 25, color: '#10B981' },
      { name: 'Chicago', value: 20, color: '#F59E0B' },
      { name: 'Miami', value: 15, color: '#EF4444' },
      { name: 'Others', value: 5, color: '#8B5CF6' }
    ]
  };

  const displayData = data || defaultData;

  if (!expanded) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart 
          data={displayData.inventoryTrends.slice(-4)} 
          title="Recent Inventory Trends"
        />
        <SimplePieChart 
          data={displayData.branchUsage} 
          title="Branch Usage Distribution"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Statistics & Analytics</h2>
            <p className="text-purple-100">Detailed insights into your storage activities</p>
          </div>
          <BarChart3 className="h-16 w-16 text-purple-200" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Transactions"
          value="1,234"
          change="+12.5%"
          icon={Activity}
          color="blue"
        />
        <StatCard
          title="Average Storage Time"
          value="45 days"
          change="+5.2%"
          icon={TrendingUp}
          color="green"
        />
        <StatCard
          title="Most Used Branch"
          value="New York"
          change="+8.1%"
          icon={BarChart3}
          color="purple"
        />
        <StatCard
          title="Storage Efficiency"
          value="92%"
          change="+3.7%"
          icon={PieChart}
          color="orange"
        />
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleBarChart 
          data={displayData.inventoryTrends} 
          title="Monthly Inventory Trends"
        />
        <SimplePieChart 
          data={displayData.branchUsage} 
          title="Branch Usage Distribution"
        />
      </div>
    </div>
  );
};

export default StatisticsSection;
