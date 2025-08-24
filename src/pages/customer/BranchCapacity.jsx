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
  AlertTriangle,
  RefreshCw,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { branchAPI } from '../../services/branches';

const BranchCapacity = () => {
  const navigate = useNavigate();
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const branchesData = await branchAPI.getAllBranches();
      setBranches(branchesData);
    } catch (error) {
      console.error('Error fetching branches:', error);
      setError('Failed to fetch branches. Please try again.');
      // Fallback to empty array if API fails
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  const getCapacityPercentage = (used, total) => {
    if (!total || total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  const getBranchStatus = (branch) => {
    const capacity = branch.capacity || 0;
    const availableSpace = branch.available_space || 0;
    const usedSpace = capacity - availableSpace;
    const usedPercentage = getCapacityPercentage(usedSpace, capacity);
    
    if (usedPercentage >= 95) return 'full';
    if (usedPercentage >= 80) return 'busy';
    if (usedPercentage >= 50) return 'optimal';
    return 'available';
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
      case 'busy': return Activity;
      case 'full': return AlertTriangle;
      default: return Package;
    }
  };

  const CapacityBar = ({ capacity, availableSpace, status }) => {
    const usedSpace = (capacity || 0) - (availableSpace || 0);
    const percentage = getCapacityPercentage(usedSpace, capacity);
    let barColor = 'bg-green-500';
    
    if (percentage > 90) barColor = 'bg-red-500';
    else if (percentage > 75) barColor = 'bg-orange-500';
    else if (percentage > 50) barColor = 'bg-blue-500';

    return (
      <div className="w-full">
        <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
          <span>{usedSpace.toLocaleString()} used</span>
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
          <span>{(capacity || 0).toLocaleString()} total</span>
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
            <div className="flex items-center space-x-4">
              <button 
                onClick={fetchBranches}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </button>
              <div className="flex items-center space-x-2 text-blue-600">
                <Building2 className="h-8 w-8" />
                <span className="text-2xl font-bold">StockHub</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

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
                  {branches.reduce((sum, branch) => sum + (branch.capacity || 0), 0).toLocaleString()}
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
                  {branches.reduce((sum, branch) => sum + (branch.available_space || 0), 0).toLocaleString()}
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
                  {branches.length > 0 ? Math.round(branches.reduce((sum, branch) => {
                    const capacity = branch.capacity || 0;
                    const availableSpace = branch.available_space || 0;
                    const usedSpace = capacity - availableSpace;
                    return sum + getCapacityPercentage(usedSpace, capacity);
                  }, 0) / branches.length) : 0}%
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
          ) : branches.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Building2 className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No branches found</h3>
              <p className="mt-2 text-gray-500">
                {error ? 'Please check your connection and try again.' : 'No warehouse branches are currently available.'}
              </p>
              <button
                onClick={fetchBranches}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </button>
            </div>
          ) : (
            branches.map((branch) => {
              const status = getBranchStatus(branch);
              const StatusIcon = getStatusIcon(status);
              const capacity = branch.capacity || 0;
              const availableSpace = branch.available_space || 0;
              const usedSpace = capacity - availableSpace;
              
              return (
                <div 
                  key={branch.id} 
                  className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Branch Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-white">{branch.name || 'Unnamed Branch'}</h3>
                        <p className="text-blue-100 flex items-center mt-1">
                          <MapPin className="h-4 w-4 mr-1" />
                          {branch.location || 'Location not specified'}
                        </p>
                      </div>
                      <div className={`flex items-center px-3 py-1 rounded-full border ${getStatusColor(status)}`}>
                        <StatusIcon className="h-4 w-4 mr-1" />
                        <span className="font-medium capitalize">{status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Branch Details */}
                  <div className="p-8 space-y-6">
                    {/* Capacity Information */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Storage Capacity</h4>
                      <CapacityBar 
                        capacity={capacity}
                        availableSpace={availableSpace}
                        status={status} 
                      />
                      <div className="mt-4 text-sm text-gray-600">
                        <span className="font-medium text-green-600">
                          {availableSpace.toLocaleString()} units available
                        </span>
                        {' for immediate storage'}
                      </div>
                    </div>

                    {/* Description */}
                    {branch.description && (
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2">Description</h5>
                        <p className="text-gray-600">{branch.description}</p>
                      </div>
                    )}

                    {/* Contact Information - Mock data since not in DB */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2 flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          Manager
                        </h5>
                        <p className="text-gray-600">Branch Manager</p>
                        <p className="text-sm text-blue-600">Contact for details</p>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-700 mb-2 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Hours
                        </h5>
                        <p className="text-gray-600">9:00 AM - 6:00 PM</p>
                      </div>
                    </div>

                    {/* Features - Mock data */}
                    <div>
                      <h5 className="font-semibold text-gray-700 mb-3 flex items-center">
                        <Zap className="h-4 w-4 mr-1" />
                        Features
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {['Secure Storage', 'Climate Controlled', '24/7 Access'].map((feature, index) => (
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
                        disabled={status === 'full'}
                      >
                        <Package className="mr-2 h-4 w-4" />
                        {status === 'full' ? 'Currently Full' : 'Store Items Here'}
                      </button>
                      <button className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200">
                        <MapPin className="mr-2 h-4 w-4" />
                        Get Directions
                      </button>
                    </div>

                    {/* Last Updated */}
                    <div className="text-xs text-gray-500 border-t border-gray-100 pt-3">
                      Created: {branch.created_at ? new Date(branch.created_at).toLocaleString() : 'Date not available'}
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
