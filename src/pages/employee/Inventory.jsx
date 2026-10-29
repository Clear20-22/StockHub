import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../contexts/NotificationContext';
import { goodsAPI, branchesAPI } from '../../services/api';
import {
  ArrowLeft,
  Package,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Minus,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Warehouse,
  BarChart3,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Download,
  Upload,
  Scan
} from 'lucide-react';

// Older records may miss fields, so derive everything defensively
const getStockStatus = (quantity, threshold) => {
  if (quantity <= 0) return 'out-of-stock';
  if (quantity <= threshold) return 'low-stock';
  return 'in-stock';
};

const EmployeeInventory = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const [goods, setGoods] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Ids of items with a stock update in flight
  const [savingIds, setSavingIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      setError(null);
      // The goods endpoint is paginated (max 100 per page), so fetch every page
      const allGoods = [];
      let page = 1;
      let totalPages = 1;
      do {
        const response = await goodsAPI.getGoods({ page, limit: 100 });
        allGoods.push(...(response.data?.goods || []));
        totalPages = response.data?.total_pages || 1;
        page += 1;
      } while (page <= totalPages);
      setGoods(allGoods);

      // Branch names are only used for the location column, so don't fail the page without them
      try {
        const branchesResponse = await branchesAPI.getBranches();
        setBranches(Array.isArray(branchesResponse.data) ? branchesResponse.data : []);
      } catch (branchError) {
        console.error('Error fetching branches:', branchError);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setError(error.response?.data?.detail || 'Failed to load inventory. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Map API goods to the shape the table uses
  const inventory = goods.map(good => {
    const quantity = Number(good.quantity) || 0;
    const minQuantity = Number(good.low_stock_threshold) || 0;
    const branch = branches.find(b => good.branch_id != null && String(b.id) === String(good.branch_id));
    return {
      id: good.id,
      name: good.name || 'Unnamed item',
      sku: good.sku || '',
      category: good.category || 'Uncategorized',
      description: good.description || '',
      supplier: good.supplier || '',
      quantity,
      minQuantity,
      price: Number(good.price_per_unit) || 0,
      location: branch ? [branch.name, branch.location].filter(Boolean).join(' - ') : 'No branch assigned',
      status: getStockStatus(quantity, minQuantity),
      lastUpdated: good.updated_at || good.created_at || null
    };
  });

  const filteredInventory = inventory.filter(item => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = item.name.toLowerCase().includes(term) ||
                         item.sku.toLowerCase().includes(term) ||
                         item.description.toLowerCase().includes(term) ||
                         item.supplier.toLowerCase().includes(term);
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800';
      case 'out-of-stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in-stock': return <CheckCircle className="h-4 w-4" />;
      case 'low-stock': return <AlertTriangle className="h-4 w-4" />;
      case 'out-of-stock': return <Clock className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  // +/- buttons: record a 1-unit stock in/out on the server and use its result for the row
  const handleQuantityUpdate = async (item, type) => {
    if (savingIds.includes(item.id)) return;
    if (type === 'outward' && item.quantity <= 0) return;
    const newQuantity = type === 'inward' ? item.quantity + 1 : item.quantity - 1;
    try {
      setSavingIds(prev => [...prev, item.id]);
      const response = await goodsAPI.updateStock(item.id, {
        type,
        quantity: 1,
        reason: type === 'inward' ? 'Stock received (employee inventory)' : 'Stock dispatched (employee inventory)',
        good_id: item.id,
        previous_quantity: item.quantity,
        new_quantity: newQuantity,
        updated_at: new Date().toISOString()
      });
      const updated = response.data?.goods;
      if (updated?.id) {
        setGoods(prev => prev.map(good => (good.id === updated.id ? { ...good, ...updated } : good)));
      } else {
        fetchInventory();
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      notify.error(error.response?.data?.detail || `Failed to update stock for ${item.name}`);
    } finally {
      setSavingIds(prev => prev.filter(id => id !== item.id));
    }
  };

  const formatDate = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
  };

  const categories = [...new Set(inventory.map(item => item.category))].sort();
  const stats = {
    totalItems: inventory.length,
    inStock: inventory.filter(item => item.status === 'in-stock').length,
    lowStock: inventory.filter(item => item.status === 'low-stock').length,
    outOfStock: inventory.filter(item => item.status === 'out-of-stock').length,
    totalValue: inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mt-18">
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
                <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
                <p className="text-gray-600 mt-1">Monitor and update inventory items</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                <Scan className="mr-2 h-4 w-4" />
                Scan Item
              </button>
              <button
                onClick={fetchInventory}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lowStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">{stats.outOfStock}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search inventory..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button className="flex-1 flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {error ? (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Could not load inventory</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchInventory}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </button>
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory yet</h3>
              <p className="text-gray-600">No goods have been added to the inventory.</p>
            </div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-600">No inventory items match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredInventory.map((item) => {
                    const saving = savingIds.includes(item.id);
                    return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">SKU: {item.sku || '—'}</div>
                          {item.description && (
                            <div className="text-xs text-gray-400 max-w-xs truncate">{item.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityUpdate(item, 'outward')}
                            disabled={saving || item.quantity <= 0}
                            title="Remove 1 from stock"
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="text-sm font-medium text-gray-900 min-w-[2rem] text-center">
                            {saving ? (
                              <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 align-middle"></span>
                            ) : item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityUpdate(item, 'inward')}
                            disabled={saving}
                            title="Add 1 to stock"
                            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Min: {item.minQuantity}
                          {formatDate(item.lastUpdated) && ` | Updated ${formatDate(item.lastUpdated)}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1 capitalize">{item.status.replace('-', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Warehouse className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{item.location}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${(item.quantity * item.price).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          ${item.price.toLocaleString()} each
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="text-blue-600 hover:text-blue-900 p-1">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900 p-1">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-gray-400 hover:text-gray-600 p-1">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stock Update</h3>
            <p className="text-sm text-gray-600 mb-4">Scan barcodes to quickly update inventory levels</p>
            <button className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Scan className="h-4 w-4 mr-2" />
              Start Scanning
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Low Stock Alerts</h3>
            <p className="text-sm text-gray-600 mb-4">{stats.lowStock} items are running low</p>
            <button className="w-full flex items-center justify-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
              <AlertTriangle className="h-4 w-4 mr-2" />
              View Low Stock
            </button>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Report</h3>
            <p className="text-sm text-gray-600 mb-4">Generate detailed inventory reports</p>
            <button className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <BarChart3 className="h-4 w-4 mr-2" />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeInventory;
