import React, { useState } from 'react';
import { Package, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const CustomerDashboardStatic = () => {
  // Static data - no API calls, no authentication required
  const staticStats = {
    total_goods: 12,
    active_orders: 3,
    completed_orders: 18,
    warehouse_value: 15420
  };

  const staticActivity = [
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
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome back, Customer!
          </h1>
          <p className="text-gray-600">
            Static Customer Dashboard - No Authentication Required
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-2">
              <Package className="h-6 w-6 text-blue-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Total Goods</h3>
            </div>
            <p className="text-3xl font-bold text-blue-600">{staticStats.total_goods}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-2">
              <Clock className="h-6 w-6 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Active Orders</h3>
            </div>
            <p className="text-3xl font-bold text-green-600">{staticStats.active_orders}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-2">
              <CheckCircle className="h-6 w-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Completed Orders</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">{staticStats.completed_orders}</p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center mb-2">
              <TrendingUp className="h-6 w-6 text-orange-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Total Value</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">${staticStats.warehouse_value.toLocaleString()}</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {staticActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${
                    activity.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">{activity.title}</h3>
                  <p className="text-gray-600">{activity.description}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(activity.timestamp).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerDashboardStatic;
