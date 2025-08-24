import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { branchAPI } from '../../services/branches';
import { 
  ArrowLeft,
  Plus,
  Search,
  Building2,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Warehouse,
  Activity,
  CheckCircle,
  RefreshCw,
  Save,
  Download,
  Calculator,
  AlertCircle
} from 'lucide-react';

const ManageBranches = () => {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  // New branch form data
  const [newBranch, setNewBranch] = useState({
    name: '',
    location: '',
    description: '',
    capacity: '',
    available_space: ''
  });

  // Capacity management state
  const [capacityData, setCapacityData] = useState({
    currentCapacity: 0,
    newCapacity: 0,
    usedSpace: 0,
    availableSpace: 0
  });

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
      // Fallback to mock data if API fails
      const mockBranches = [
        {
          id: 1,
          name: 'StockHub Gulshan',
          location: 'Dhaka City',
          description: 'Primary branch serving Dhaka division',
          capacity: 1000,
          available_space: 750,
          manager_id: null,
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'StockHub Agrabad',
          location: 'Chattogram City',
          description: 'Primary branch serving Chattogram division',
          capacity: 1000,
          available_space: 850,
          manager_id: null,
          created_at: '2024-01-02T00:00:00Z'
        }
      ];
      setBranches(mockBranches);
    } finally {
      setLoading(false);
    }
  };

  const filteredBranches = branches.filter(branch => 
    (branch.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (branch.location || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddBranch = async () => {
    setActionLoading(true);
    try {
      const branchData = {
        name: newBranch.name,
        location: newBranch.location,
        description: newBranch.description,
        capacity: parseInt(newBranch.capacity) || 0,
        available_space: parseInt(newBranch.available_space) || parseInt(newBranch.capacity) || 0
      };
      
      await branchAPI.createBranch(branchData);
      await fetchBranches(); // Refresh the list
      setShowAddModal(false);
      setNewBranch({
        name: '',
        location: '',
        description: '',
        capacity: '',
        available_space: ''
      });
    } catch (error) {
      console.error('Error adding branch:', error);
      setError('Failed to add branch. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditBranch = async () => {
    setActionLoading(true);
    try {
      await branchAPI.updateBranch(selectedBranch.id, selectedBranch);
      await fetchBranches(); // Refresh the list
      setShowEditModal(false);
      setSelectedBranch(null);
    } catch (error) {
      console.error('Error updating branch:', error);
      setError('Failed to update branch. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBranch = async (branchId) => {
    if (window.confirm('Are you sure you want to delete this branch? This action cannot be undone.')) {
      setActionLoading(true);
      try {
        await branchAPI.deleteBranch(branchId);
        await fetchBranches(); // Refresh the list
      } catch (error) {
        console.error('Error deleting branch:', error);
        setError('Failed to delete branch. Please try again.');
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleCapacityManagement = (branch) => {
    setSelectedBranch(branch);
    setCapacityData({
      currentCapacity: branch.capacity || 0,
      newCapacity: branch.capacity || 0,
      usedSpace: (branch.capacity || 0) - (branch.available_space || 0),
      availableSpace: branch.available_space || 0
    });
    setShowCapacityModal(true);
  };

  const handleUpdateCapacity = async () => {
    setActionLoading(true);
    try {
      await branchAPI.updateBranchCapacity(
        selectedBranch.id,
        capacityData.newCapacity,
        capacityData.usedSpace
      );
      await fetchBranches(); // Refresh the list
      setShowCapacityModal(false);
      setSelectedBranch(null);
    } catch (error) {
      console.error('Error updating capacity:', error);
      setError('Failed to update capacity. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const calculateAvailableSpace = (capacity, usedSpace) => {
    return Math.max(0, capacity - usedSpace);
  };

  const getCapacityPercentage = (used, total) => {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  const getCapacityColor = (percentage) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getBranchStatus = (branch) => {
    const usedPercentage = getCapacityPercentage((branch.capacity || 0) - (branch.available_space || 0), branch.capacity || 0);
    
    if (usedPercentage >= 95) {
      return {
        label: 'Critical',
        color: 'bg-red-100 text-red-800',
        icon: AlertTriangle,
        iconColor: 'text-red-500'
      };
    } else if (usedPercentage >= 85) {
      return {
        label: 'High Usage',
        color: 'bg-orange-100 text-orange-800',
        icon: AlertTriangle,
        iconColor: 'text-orange-500'
      };
    } else if (usedPercentage >= 70) {
      return {
        label: 'Moderate',
        color: 'bg-yellow-100 text-yellow-800',
        icon: Activity,
        iconColor: 'text-yellow-500'
      };
    } else if (usedPercentage >= 50) {
      return {
        label: 'Active',
        color: 'bg-blue-100 text-blue-800',
        icon: CheckCircle,
        iconColor: 'text-blue-500'
      };
    } else {
      return {
        label: 'Available',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle,
        iconColor: 'text-green-500'
      };
    }
  };

  const calculateStats = () => {
    const totalBranches = branches.length;
    const totalCapacity = branches.reduce((sum, b) => sum + (b.capacity || 0), 0);
    const totalUsedSpace = branches.reduce((sum, b) => sum + ((b.capacity || 0) - (b.available_space || 0)), 0);
    const totalAvailableSpace = branches.reduce((sum, b) => sum + (b.available_space || 0), 0);
    const averageUtilization = totalCapacity > 0 ? Math.round((totalUsedSpace / totalCapacity) * 100) : 0;

    return { 
      totalBranches, 
      totalCapacity, 
      totalUsedSpace,
      totalAvailableSpace, 
      averageUtilization 
    };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mt-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/admin/dashboard')}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Branches</h1>
                <p className="text-gray-600 mt-1">View and manage warehouse branches and locations</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Branch
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                <Download className="mr-2 h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Branches</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBranches}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCapacity.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Used Space</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsedSpace.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Space</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAvailableSpace.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-indigo-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg Utilization</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageUtilization}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search branches by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button 
              onClick={fetchBranches}
              className="flex items-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Branches Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading branches...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBranches.map((branch) => (
              <div key={branch.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <Building2 className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{branch.name || 'Unnamed Branch'}</h3>
                        <p className="text-sm text-gray-500">{branch.location || 'Location not specified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {(() => {
                        const status = getBranchStatus(branch);
                        const StatusIcon = status.icon;
                        return (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className={`h-3 w-3 mr-1 ${status.iconColor}`} />
                            {status.label}
                          </span>
                        );
                      })()}
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleCapacityManagement(branch)}
                          className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Manage Capacity"
                        >
                          <Calculator className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBranch(branch);
                            setShowEditModal(true);
                          }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit Branch"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBranch(branch.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Branch"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{branch.location || 'Location not specified'}</span>
                  </div>

                  {/* Description */}
                  {branch.description && (
                    <div className="text-sm text-gray-600 mb-4">
                      <p>{branch.description}</p>
                    </div>
                  )}

                  {/* Capacity Information */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span>Storage Capacity</span>
                      <div className="flex items-center space-x-2">
                        <span>{getCapacityPercentage((branch.capacity || 0) - (branch.available_space || 0), branch.capacity || 0)}% Used</span>
                        {(() => {
                          const status = getBranchStatus(branch);
                          const StatusIcon = status.icon;
                          return (
                            <div className="flex items-center" title={`Status: ${status.label}`}>
                              <StatusIcon className={`h-4 w-4 ${status.iconColor}`} />
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className={`h-2 rounded-full ${getCapacityColor(getCapacityPercentage((branch.capacity || 0) - (branch.available_space || 0), branch.capacity || 0))}`}
                        style={{ width: `${getCapacityPercentage((branch.capacity || 0) - (branch.available_space || 0), branch.capacity || 0)}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                      <div>
                        <span className="font-medium">Total:</span>
                        <br />
                        <span>{(branch.capacity || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">Used:</span>
                        <br />
                        <span>{((branch.capacity || 0) - (branch.available_space || 0)).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-medium">Available:</span>
                        <br />
                        <span>{(branch.available_space || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Created Date */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Created: {branch.created_at ? new Date(branch.created_at).toLocaleDateString() : 'Date not available'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredBranches.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No branches found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding a new branch location.</p>
            <div className="mt-6">
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="-ml-1 mr-2 h-5 w-5" />
                Add Branch
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Branch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Branch</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name *</label>
                <input
                  type="text"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch({...newBranch, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter branch name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={newBranch.location}
                  onChange={(e) => setNewBranch({...newBranch, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter location (e.g., Dhaka City, Bangladesh)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newBranch.description}
                  onChange={(e) => setNewBranch({...newBranch, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Brief description of the branch (optional)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Capacity *</label>
                  <input
                    type="number"
                    value={newBranch.capacity}
                    onChange={(e) => setNewBranch({...newBranch, capacity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Total storage capacity"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Space</label>
                  <input
                    type="number"
                    value={newBranch.available_space}
                    onChange={(e) => setNewBranch({...newBranch, available_space: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Available storage space"
                    min="0"
                    max={newBranch.capacity || undefined}
                  />
                </div>
              </div>

              {newBranch.capacity && newBranch.available_space && parseInt(newBranch.available_space) > parseInt(newBranch.capacity) && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  Available space cannot be greater than total capacity
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewBranch({
                    name: '',
                    location: '',
                    description: '',
                    capacity: '',
                    available_space: ''
                  });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddBranch}
                disabled={actionLoading || !newBranch.name || !newBranch.location || !newBranch.capacity}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Adding...' : 'Add Branch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Branch Modal */}
      {showEditModal && selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Branch</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name *</label>
                <input
                  type="text"
                  value={selectedBranch.name || ''}
                  onChange={(e) => setSelectedBranch({...selectedBranch, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
                <input
                  type="text"
                  value={selectedBranch.location || ''}
                  onChange={(e) => setSelectedBranch({...selectedBranch, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={selectedBranch.description || ''}
                  onChange={(e) => setSelectedBranch({...selectedBranch, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Capacity *</label>
                  <input
                    type="number"
                    value={selectedBranch.capacity || 0}
                    onChange={(e) => setSelectedBranch({...selectedBranch, capacity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Available Space</label>
                  <input
                    type="number"
                    value={selectedBranch.available_space || 0}
                    onChange={(e) => setSelectedBranch({...selectedBranch, available_space: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max={selectedBranch.capacity || 0}
                  />
                </div>
              </div>

              {selectedBranch.available_space && selectedBranch.capacity && selectedBranch.available_space > selectedBranch.capacity && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  Available space cannot be greater than total capacity
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedBranch(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditBranch}
                disabled={actionLoading || !selectedBranch.name || !selectedBranch.location}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Updating...' : 'Update Branch'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Capacity Management Modal */}
      {showCapacityModal && selectedBranch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Capacity - {selectedBranch.name}</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Status</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Total Capacity:</span>
                    <p className="font-semibold">{(capacityData.currentCapacity || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Used Space:</span>
                    <p className="font-semibold">{(capacityData.usedSpace || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Available Space:</span>
                    <p className="font-semibold">{(capacityData.availableSpace || 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Utilization:</span>
                    <p className="font-semibold">{getCapacityPercentage(capacityData.usedSpace, capacityData.currentCapacity)}%</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Total Capacity</label>
                <input
                  type="number"
                  value={capacityData.newCapacity}
                  onChange={(e) => {
                    const newCap = parseInt(e.target.value) || 0;
                    setCapacityData({
                      ...capacityData,
                      newCapacity: newCap,
                      availableSpace: calculateAvailableSpace(newCap, capacityData.usedSpace)
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Used Space</label>
                <input
                  type="number"
                  value={capacityData.usedSpace}
                  onChange={(e) => {
                    const used = parseInt(e.target.value) || 0;
                    setCapacityData({
                      ...capacityData,
                      usedSpace: used,
                      availableSpace: calculateAvailableSpace(capacityData.newCapacity, used)
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max={capacityData.newCapacity}
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>New Available Space:</strong> {calculateAvailableSpace(capacityData.newCapacity, capacityData.usedSpace).toLocaleString()}
                </p>
                <p className="text-sm text-blue-700">
                  <strong>New Utilization:</strong> {getCapacityPercentage(capacityData.usedSpace, capacityData.newCapacity)}%
                </p>
              </div>

              {capacityData.usedSpace > capacityData.newCapacity && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Used space cannot exceed total capacity
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCapacityModal(false);
                  setSelectedBranch(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCapacity}
                disabled={actionLoading || capacityData.usedSpace > capacityData.newCapacity}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Updating...' : 'Update Capacity'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageBranches;
