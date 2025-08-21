import React, { useState, useEffect } from 'react';
import { 
  Building2,
  BarChart3,
  Package,
  ArrowLeft,
  MapPin,
  Users,
  Zap,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BranchCapacity = () => {
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock branch data
  const branches = [
    {
      id: 1,
      name: 'Main Warehouse',
      location: 'Downtown District',
      address: '123 Storage St, Central City',
      totalCapacity: 10000,
      usedCapacity: 7500,
      availableCapacity: 2500,
      status: 'optimal',
      manager: 'John Smith',
      phone: '+1 (555) 123-4567',
      features: ['Climate Controlled', '24/7 Security', 'Loading Dock', 'Insurance'],
      operatingHours: '6:00 AM - 10:00 PM',
      lastUpdated: '2024-08-21T14:30:00Z'
    },
    {
      id: 2,
      name: 'North Branch',
      location: 'Industrial Zone',
      address: '456 Warehouse Ave, North City',
      totalCapacity: 8000,
      usedCapacity: 6800,
      availableCapacity: 1200,
      status: 'busy',
      manager: 'Sarah Johnson',
      phone: '+1 (555) 234-5678',
      features: ['High Security', 'Refrigerated Units', 'Forklift Access'],
      operatingHours: '7:00 AM - 9:00 PM',
      lastUpdated: '2024-08-21T13:45:00Z'
    },
    {
      id: 3,
      name: 'East Storage',
      location: 'Business Park',
      address: '789 Commerce Blvd, East City',
      totalCapacity: 6000,
      usedCapacity: 5400,
      availableCapacity: 600,
      status: 'full',
      manager: 'Mike Wilson',
      phone: '+1 (555) 345-6789',
      features: ['Document Storage', 'Digital Catalog', 'Quick Access'],
      operatingHours: '8:00 AM - 8:00 PM',
      lastUpdated: '2024-08-21T15:15:00Z'
    },
    {
      id: 4,
      name: 'West Facility',
      location: 'Tech District',
      address: '321 Innovation Dr, West City',
      totalCapacity: 12000,
      usedCapacity: 3600,
      availableCapacity: 8400,
      status: 'available',
      manager: 'Lisa Chen',
      phone: '+1 (555) 456-7890',
      features: ['Smart Storage', 'Automated Systems', 'Premium Security'],
      operatingHours: '24/7 Access',
      lastUpdated: '2024-08-21T16:00:00Z'
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const getCapacityPercentage = (used, total) => {
    return Math.round((used / total) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'optimal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'busy': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'full': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available': return CheckCircle;
      case 'optimal': return TrendingUp;
      case 'busy': return Clock;
      case 'full': return AlertTriangle;
      default: return Package;
    }
  };

  const CapacityBar = ({ used, total, status }) => {
    const percentage = getCapacityPercentage(used, total);
    let barColor = 'bg-green-500';
    
    if (percentage > 90) barColor = 'bg-red-500';
    else if (percentage > 75) barColor = 'bg-orange-500';
    else if (percentage > 50) barColor = 'bg-blue-500';

    return (
      <div className="w-full">
        <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
          <span>{used.toLocaleString()} sq ft used</span>
          <span>{percentage}% full</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ${barColor}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0</span>
          <span>{total.toLocaleString()} sq ft total</span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/customer/dashboard')}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Branch Capacity</h1>
                <p className="text-gray-600 mt-1">Real-time warehouse availability and capacity information</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-blue-600">
              <Building2 className="h-8 w-8" />
              <span className="text-2xl font-bold">StockHub</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Branches</p>
                <p className="text-3xl font-bold text-blue-600">{branches.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                <p className="text-3xl font-bold text-green-600">
                  {branches.reduce((sum, branch) => sum + branch.totalCapacity, 0).toLocaleString()} 
                  <span className="text-lg text-gray-500 font-normal"> sq ft</span>
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available Space</p>
                <p className="text-3xl font-bold text-orange-600">
                  {branches.reduce((sum, branch) => sum + branch.availableCapacity, 0).toLocaleString()}
                  <span className="text-lg text-gray-500 font-normal"> sq ft</span>
                </p>
              </div>
              <Package className="h-8 w-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Utilization</p>
                <p className="text-3xl font-bold text-purple-600">
                  {Math.round(branches.reduce((sum, branch) => sum + getCapacityPercentage(branch.usedCapacity, branch.totalCapacity), 0) / branches.length)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Branch Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-xl p-8 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            ))
          ) : (
            branches.map((branch) => {
              const StatusIcon = getStatusIcon(branch.status);
              const capacityPercentage = getCapacityPercentage(branch.usedCapacity, branch.totalCapacity);
              
              return (
                <div 
                  key={branch.id} 
                  className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Branch Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{branch.name}</h3>
                        <p className="text-blue-100 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {branch.location}
                        </p>
                      </div>
                      <div className={`flex items-center px-3 py-1 rounded-full border ${getStatusColor(branch.status)}`}>
                        <StatusIcon className="h-4 w-4 mr-1" />
                        <span className="font-medium capitalize">{branch.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Branch Details */}
                  <div className="p-8 space-y-6">
                    {/* Capacity Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Storage Capacity</h4>
                      <CapacityBar 
                        used={branch.usedCapacity} 
                        total={branch.totalCapacity} 
                        status={branch.status} 
                      />
                      <div className="mt-4 text-sm text-gray-600">
                        <span className="font-medium text-green-600">
                          {branch.availableCapacity.toLocaleString()} sq ft available
                        </span>
                        {' for immediate storage'}
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2 flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          Manager
                        </h5>
                        <p className="text-gray-600">{branch.manager}</p>
                        <p className="text-sm text-blue-600">{branch.phone}</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Hours
                        </h5>
                        <p className="text-gray-600">{branch.operatingHours}</p>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <h5 className="font-semibold text-gray-700 mb-2 flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        Address
                      </h5>
                      <p className="text-gray-600">{branch.address}</p>
                    </div>

                    {/* Features */}
                    <div>
                      <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <Zap className="h-4 w-4 mr-1" />
                        Features
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {branch.features.map((feature, index) => (
                          <span 
                            key={index}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-200"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                      <button 
                        onClick={() => navigate('/customer/store-goods')}
                        className="flex-1 flex items-center justify-center px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        disabled={branch.status === 'full'}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        {branch.status === 'full' ? 'Currently Full' : 'Store Items Here'}
                      </button>
                      <button className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200">
                        <MapPin className="mr-2 h-4 w-4" />
                        Get Directions
                      </button>
                    </div>

                    {/* Last Updated */}
                    <div className="text-xs text-gray-500 border-t border-gray-100 pt-3">
                      Last updated: {new Date(branch.lastUpdated).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default BranchCapacity;
