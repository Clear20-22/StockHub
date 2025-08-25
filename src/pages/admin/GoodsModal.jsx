import React, { useState, useEffect } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { goodsAPI } from '../../services/api';
import { 
  X, 
  Package, 
  Save, 
  AlertCircle,
  Barcode,
  Building2,
  Calendar,
  Hash,
  User,
  Tag
} from 'lucide-react';

const GoodsModal = ({ isOpen, onClose, good, mode, branches, onSuccess }) => {
  const { showNotification } = useNotification();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    sku: '',
    supplier: '',
    quantity: 0,
    price_per_unit: 0,
    low_stock_threshold: 10,
    batch_no: '',
    expiry_date: '',
    branch_id: '',
    product_id: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    'Electronics', 'Clothing', 'Food & Beverages', 'Furniture', 'Books',
    'Toys', 'Sports', 'Beauty', 'Home & Garden', 'Automotive', 'Other'
  ];

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && good) {
        setFormData({
          name: good.name || '',
          description: good.description || '',
          category: good.category || '',
          sku: good.sku || '',
          supplier: good.supplier || '',
          quantity: good.quantity || 0,
          price_per_unit: good.price_per_unit || 0,
          low_stock_threshold: good.low_stock_threshold || 10,
          batch_no: good.batch_no || '',
          expiry_date: good.expiry_date ? good.expiry_date.split('T')[0] : '',
          branch_id: good.branch_id || '',
          product_id: good.product_id || ''
        });
      } else {
        // Generate auto product ID for new items
        const autoId = `PRD-${Date.now().toString().slice(-6)}`;
        setFormData({
          name: '',
          description: '',
          category: '',
          sku: '',
          supplier: '',
          quantity: 0,
          price_per_unit: 0,
          low_stock_threshold: 10,
          batch_no: '',
          expiry_date: '',
          branch_id: '',
          product_id: autoId
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, good]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.branch_id) {
      newErrors.branch_id = 'Branch assignment is required';
    }

    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }

    if (formData.price_per_unit < 0) {
      newErrors.price_per_unit = 'Price cannot be negative';
    }

    if (formData.low_stock_threshold < 0) {
      newErrors.low_stock_threshold = 'Threshold cannot be negative';
    }

    // Validate expiry date if provided
    if (formData.expiry_date) {
      const expiryDate = new Date(formData.expiry_date);
      const today = new Date();
      if (expiryDate <= today) {
        newErrors.expiry_date = 'Expiry date should be in the future';
      }
    }

    // Validate SKU format (optional but should be unique if provided)
    if (formData.sku && formData.sku.length < 3) {
      newErrors.sku = 'SKU should be at least 3 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Please fix the form errors', 'error');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        ...formData,
        branch_id: parseInt(formData.branch_id),
        quantity: parseInt(formData.quantity),
        price_per_unit: parseFloat(formData.price_per_unit),
        low_stock_threshold: parseInt(formData.low_stock_threshold)
      };

      if (mode === 'edit') {
        await goodsAPI.updateGood(good.id || good._id, submitData);
        showNotification('Item updated successfully!', 'success');
      } else {
        await goodsAPI.createGood(submitData);
        showNotification('Item created successfully!', 'success');
      }

      // Call onSuccess to refresh the goods list
      if (onSuccess) {
        await onSuccess();
      }
      
      // Close the modal after successful operation
      onClose();
    } catch (error) {
      console.error('Failed to save good:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to save item. Please try again.';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {mode === 'edit' ? 'Edit Item' : 'Add New Item'}
              </h2>
              <p className="text-sm text-gray-500">
                {mode === 'edit' ? 'Update item information' : 'Add a new item to your inventory'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product ID */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Hash className="w-4 h-4 mr-1" />
                  Product ID
                </label>
                <input
                  type="text"
                  name="product_id"
                  value={formData.product_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                  placeholder="Auto-generated"
                  readOnly={mode === 'create'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {mode === 'create' ? 'Automatically generated' : 'Cannot be changed'}
                </p>
              </div>

              {/* Product Name */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Tag className="w-4 h-4 mr-1" />
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter product name"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.name}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Product description (optional)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.category}
                  </p>
                )}
              </div>

              {/* Branch */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Building2 className="w-4 h-4 mr-1" />
                  Branch *
                </label>
                <select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.branch_id ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
                {errors.branch_id && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.branch_id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Barcode className="w-5 h-5 mr-2 text-green-600" />
              Product Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SKU/Barcode */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Barcode className="w-4 h-4 mr-1" />
                  SKU/Barcode
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.sku ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter SKU or barcode"
                />
                {errors.sku && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.sku}
                  </p>
                )}
              </div>

              {/* Supplier */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <User className="w-4 h-4 mr-1" />
                  Supplier
                </label>
                <input
                  type="text"
                  name="supplier"
                  value={formData.supplier}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Supplier name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Batch Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Number
                </label>
                <input
                  type="text"
                  name="batch_no"
                  value={formData.batch_no}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Batch number"
                />
              </div>

              {/* Expiry Date */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="w-4 h-4 mr-1" />
                  Expiry Date
                </label>
                <input
                  type="date"
                  name="expiry_date"
                  value={formData.expiry_date}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.expiry_date ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.expiry_date && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.expiry_date}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Stock & Pricing */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900">
              Stock & Pricing Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.quantity ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.quantity && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.quantity}
                  </p>
                )}
              </div>

              {/* Price per Unit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price per Unit ($)
                </label>
                <input
                  type="number"
                  name="price_per_unit"
                  value={formData.price_per_unit}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.price_per_unit ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.price_per_unit && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.price_per_unit}
                  </p>
                )}
              </div>

              {/* Low Stock Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Low Stock Alert Threshold
                </label>
                <input
                  type="number"
                  name="low_stock_threshold"
                  value={formData.low_stock_threshold}
                  onChange={handleChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.low_stock_threshold ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="10"
                />
                {errors.low_stock_threshold && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.low_stock_threshold}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  You'll be alerted when stock falls below this level
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Saving...' : mode === 'edit' ? 'Update Item' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GoodsModal;
