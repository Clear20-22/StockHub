import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Package, MapPin, User, Settings, Bell, BarChart3, Clock, CheckCircle } from 'lucide-react';

const CustomerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                  <div className="relative bg-blue-600 p-3 rounded-full">
                    <User className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.first_name}!
                  </h1>
                  <p className="text-gray-600">
                    Manage your warehouse storage and track your goods
                  </p>
                </div>
              </div>
              <div className="hidden md:flex items-center space-x-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <Bell className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200">
                  <Settings className="h-5 w-5" />
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
                <p className="text-3xl font-bold text-gray-900 mt-2">24</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600 font-semibold">+12%</span>
              <span className="text-sm text-gray-500 ml-1">from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Active Branches
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">3</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-green-600 font-semibold">All active</span>
              <span className="text-sm text-gray-500 ml-1">locations</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Storage Used
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">68%</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-xl">
                <BarChart3 className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Pending Actions
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">5</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <Bell className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-orange-600 font-semibold">2 urgent</span>
              <span className="text-sm text-gray-500 ml-1">items need attention</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              <div className="space-y-4">
                {[
                  {
                    action: 'Goods stored',
                    item: 'Electronics Box #1234',
                    time: '2 hours ago',
                    status: 'completed',
                    icon: Package
                  },
                  {
                    action: 'Pickup scheduled',
                    item: 'Furniture Set #5678',
                    time: '1 day ago',
                    status: 'pending',
                    icon: Clock
                  },
                  {
                    action: 'Storage extended',
                    item: 'Documents Box #9012',
                    time: '3 days ago',
                    status: 'completed',
                    icon: CheckCircle
                  },
                  {
                    action: 'Item retrieved',
                    item: 'Kitchen Appliances #3456',
                    time: '5 days ago',
                    status: 'completed',
                    icon: Package
                  },
                  {
                    action: 'Payment processed',
                    item: 'Monthly storage fee',
                    time: '1 week ago',
                    status: 'completed',
                    icon: CheckCircle
                  }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className={`p-2 rounded-lg ${
                      activity.status === 'completed' ? 'bg-green-100' : 'bg-orange-100'
                    }`}>
                      <activity.icon className={`h-5 w-5 ${
                        activity.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{activity.action}</p>
                      <p className="text-sm text-gray-600">{activity.item}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{activity.time}</p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Store New Items</span>
                </button>
                <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Schedule Pickup</span>
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>View All Goods</span>
                </button>
                <button className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>Contact Support</span>
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Notifications</h2>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 border-l-4 border-blue-400 rounded-lg">
                  <p className="text-sm font-semibold text-blue-800">Storage reminder</p>
                  <p className="text-xs text-blue-600">Monthly payment due in 5 days</p>
                </div>
                <div className="p-3 bg-green-50 border-l-4 border-green-400 rounded-lg">
                  <p className="text-sm font-semibold text-green-800">Pickup ready</p>
                  <p className="text-xs text-green-600">Item #5678 ready for collection</p>
                </div>
                <div className="p-3 bg-orange-50 border-l-4 border-orange-400 rounded-lg">
                  <p className="text-sm font-semibold text-orange-800">Action required</p>
                  <p className="text-xs text-orange-600">Verify storage details for Box #9012</p>
                </div>
                <div className="p-3 bg-purple-50 border-l-4 border-purple-400 rounded-lg">
                  <p className="text-sm font-semibold text-purple-800">New feature</p>
                  <p className="text-xs text-purple-600">Mobile app now available for download</p>
                </div>
              </div>
            </div>

            {/* Account Summary */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Account Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Account Status</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Member Since</span>
                  <span className="text-sm font-semibold text-gray-900">Jan 2024</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Plan Type</span>
                  <span className="text-sm font-semibold text-gray-900">Premium</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Next Billing</span>
                  <span className="text-sm font-semibold text-gray-900">Aug 25, 2025</span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <button className="w-full text-blue-600 hover:text-blue-700 font-semibold text-sm">
                    Manage Account →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
