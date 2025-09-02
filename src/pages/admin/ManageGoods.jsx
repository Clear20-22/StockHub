import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { goodsAPI, branchesAPI } from '../../services/api';
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit3,
  Trash2,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  Upload,
  ArrowLeft,
  ChevronLeft,
  Eye,
  Calendar,
  Building2,
  BarChart3,
  History
} from 'lucide-react';
import GoodsModal from './GoodsModal';
import StockUpdateModal from './StockUpdateModal';
import GoodsImportModal from './GoodsImportModal';
import AdminProtectedComponent from '../../components/admin/AdminProtectedComponent';

const ManageGoods = ({ onBack }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // State management
  const [goods, setGoods] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    branch: '',
    stockStatus: '',
    expiryStatus: ''
  });

  // Modal states
  const [goodsModal, setGoodsModal] = useState({ isOpen: false, good: null, mode: 'create' });
  const [stockModal, setStockModal] = useState({ isOpen: false, good: null });
  const [importModal, setImportModal] = useState({ isOpen: false });

  // Categories for filtering
  const categories = [
    'Electronics', 'Clothing', 'Food & Beverages', 'Furniture', 'Books',
    'Toys', 'Sports', 'Beauty', 'Home & Garden', 'Automotive', 'Other'
  ];

  const stockStatusOptions = [
    { value: 'in-stock', label: 'In Stock', color: 'green' },
    { value: 'low-stock', label: 'Low Stock', color: 'yellow' },
    { value: 'out-of-stock', label: 'Out of Stock', color: 'red' }
  ];

  const expiryStatusOptions = [
    { value: 'fresh', label: 'Fresh', color: 'green' },
    { value: 'expiring-soon', label: 'Expiring Soon', color: 'yellow' },
    { value: 'expired', label: 'Expired', color: 'red' }
  ];

  useEffect(() => {
    fetchGoods();
    fetchBranches();
  }, [currentPage, searchTerm, filters, pageSize]);

  const fetchGoods = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
        category: filters.category || undefined,
        branch: filters.branch || undefined,
        stock_status: filters.stockStatus || undefined,
        expiry_status: filters.expiryStatus || undefined
      };

      // Remove undefined values
      Object.keys(params).forEach(key => {
        if (params[key] === undefined) {
          delete params[key];
        }
      });

      const response = await goodsAPI.getGoods(params);
      
      setGoods(response.data.goods || response.data || []);
      setTotalPages(response.data.total_pages || Math.ceil((response.data.total || response.data.length || 0) / pageSize));
      setTotalCount(response.data.total || response.data.length || 0);
    } catch (error) {
      console.error('Failed to fetch goods:', error);
      showNotification('Failed to fetch goods', 'error');
      setGoods([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await branchesAPI.getBranches();
      setBranches(response.data || []);
    } catch (error) {
      console.error('Failed to fetch branches:', error);
      setBranches([]);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      branch: '',
      stockStatus: '',
      expiryStatus: ''
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleCreateGood = () => {
    setGoodsModal({ isOpen: true, good: null, mode: 'create' });
  };

  const handleEditGood = (good) => {
    setGoodsModal({ isOpen: true, good, mode: 'edit' });
  };

  const handleDeleteGood = async (good) => {
    if (!window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
      return;
    }

    try {
      const goodId = good.id || good._id;
      
      if (!goodId) {
        showNotification('Error: Could not find item ID', 'error');
        return;
      }
      
      // Delete from backend
      await goodsAPI.deleteGood(goodId);
      
      // Immediately update the UI by removing the item from the local state
      setGoods(prevGoods => prevGoods.filter(g => (g.id || g._id) !== goodId));
      setTotalCount(prevCount => Math.max(0, prevCount - 1));
      
      showNotification('Item deleted successfully', 'success');
      
      // Also refresh from server to ensure consistency
      setTimeout(() => fetchGoods(), 500); // Small delay to avoid rapid API calls
    } catch (error) {
      console.error('Failed to delete good:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to delete item';
      showNotification(errorMessage, 'error');
      
      // If deletion failed, refresh the list to ensure consistency
      fetchGoods();
    }
  };

  const handleStockUpdate = (good) => {
    setStockModal({ isOpen: true, good });
  };

  const handleExportGoods = async () => {
    try {
      const response = await goodsAPI.exportGoods();
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `goods_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotification('Goods exported successfully', 'success');
    } catch (error) {
      console.error('Failed to export goods:', error);
      showNotification('Failed to export goods', 'error');
    }
  };

  const getStockStatus = (quantity, lowStockThreshold = 10) => {
    if (quantity === 0) return 'out-of-stock';
    if (quantity <= lowStockThreshold) return 'low-stock';
    return 'in-stock';
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return 'fresh';
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring-soon';
    return 'fresh';
  };

  const getStatusBadge = (status, options) => {
    const option = options.find(opt => opt.value === status);
    if (!option) return null;

    const colors = {
      green: 'bg-green-100 text-green-800 border-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      red: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[option.color]}`}>
        {option.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <AdminProtectedComponent>
      <div className="min-h-screen py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={onBack || (() => navigate('/admin/dashboard'))}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                title="Back to Dashboard"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                  <Package className="w-10 h-10 text-blue-600 mr-4" />
                  Manage Goods
                </h1>
                <p className="text-gray-600">Comprehensive inventory management system</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setImportModal({ isOpen: true })}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </button>
              <button
                onClick={handleExportGoods}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <button
                onClick={handleCreateGood}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 mb-4">
              {/* Search */}
              <div className="lg:col-span-2 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, SKU, or supplier..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* Branch Filter */}
              <select
                value={filters.branch}
                onChange={(e) => handleFilterChange('branch', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Branches</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>

              {/* Stock Status Filter */}
              <select
                value={filters.stockStatus}
                onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Stock Status</option>
                {stockStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>

              {/* Expiry Status Filter */}
              <select
                value={filters.expiryStatus}
                onChange={(e) => handleFilterChange('expiryStatus', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Expiry Status</option>
                {expiryStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Clear Filters
              </button>
              
              <div className="text-sm text-gray-500">
                {loading ? 'Loading...' : `${goods.length} items found`}
              </div>
            </div>
          </div>

          {/* Goods Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : goods.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Package className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-500 text-center mb-4">
                  {searchTerm || Object.values(filters).some(f => f) 
                    ? 'Try adjusting your search or filters' 
                    : 'Get started by adding your first inventory item'
                  }
                </p>
                <button
                  onClick={handleCreateGood}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Item
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category & Branch
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Stock Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Batch & Expiry
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {goods.map((good) => {
                        const stockStatus = getStockStatus(good.quantity, good.low_stock_threshold);
                        const expiryStatus = getExpiryStatus(good.expiry_date);
                        const branch = branches.find(b => b.id === good.branch_id);

                        return (
                          <tr key={good.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 w-10 h-10">
                                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Package className="w-5 h-5 text-blue-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {good.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    SKU: {good.sku || 'N/A'} | ID: {good.product_id || good.id}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Supplier: {good.supplier || 'Not specified'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{good.category || 'Uncategorized'}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Building2 className="w-3 h-3 mr-1" />
                                {branch?.name || 'No branch assigned'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                {getStatusBadge(stockStatus, stockStatusOptions)}
                                <div className="text-xs text-gray-500">
                                  Qty: {good.quantity} | Price: ${good.price_per_unit || 0}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex flex-col space-y-1">
                                <div className="text-sm text-gray-900">
                                  Batch: {good.batch_no || 'N/A'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  Exp: {formatDate(good.expiry_date)}
                                </div>
                                {expiryStatus !== 'fresh' && 
                                  getStatusBadge(expiryStatus, expiryStatusOptions)
                                }
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleStockUpdate(good)}
                                  className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-50 rounded"
                                  title="Update Stock"
                                >
                                  <BarChart3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEditGood(good)}
                                  className="text-yellow-600 hover:text-yellow-900 p-1 hover:bg-yellow-50 rounded"
                                  title="Edit Item"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteGood(good)}
                                  className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Showing <span className="font-medium">{((currentPage - 1) * pageSize) + 1}</span> to{' '}
                        <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of{' '}
                        <span className="font-medium">{totalCount}</span> items
                        {totalPages > 1 && (
                          <span className="ml-2">
                            (Page {currentPage} of {totalPages})
                          </span>
                        )}
                      </p>
                      <div className="mt-1 flex items-center text-xs text-gray-500">
                        <span>Items per page:</span>
                        <select
                          value={pageSize}
                          onChange={(e) => {
                            setPageSize(parseInt(e.target.value));
                            setCurrentPage(1); // Reset to first page when changing page size
                          }}
                          className="ml-2 px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value={5}>5</option>
                          <option value={10}>10</option>
                          <option value={25}>25</option>
                          <option value={50}>50</option>
                          <option value={100}>100</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modals */}
        {goodsModal.isOpen && (
          <GoodsModal
            isOpen={goodsModal.isOpen}
            onClose={() => setGoodsModal({ isOpen: false, good: null, mode: 'create' })}
            good={goodsModal.good}
            mode={goodsModal.mode}
            branches={branches}
            onSuccess={fetchGoods}
          />
        )}

        {stockModal.isOpen && (
          <StockUpdateModal
            isOpen={stockModal.isOpen}
            onClose={() => setStockModal({ isOpen: false, good: null })}
            good={stockModal.good}
            onSuccess={fetchGoods}
          />
        )}

        {importModal.isOpen && (
          <GoodsImportModal
            isOpen={importModal.isOpen}
            onClose={() => setImportModal({ isOpen: false })}
            onSuccess={fetchGoods}
          />
        )}
      </div>
    </AdminProtectedComponent>
  );
};

export default ManageGoods;
