import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { goodsAPI } from '../../services/api';
import { 
  X, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Save, 
  AlertCircle,
  Plus,
  Minus,
  Package
} from 'lucide-react';

const StockUpdateModal = ({ isOpen, onClose, good, onSuccess }) => {
  const { showNotification } = useNotification();
  
  const [updateData, setUpdateData] = useState({
    type: 'inward', // 'inward' or 'outward'
    quantity: 0,
    reason: '',
    notes: '',
    reference_number: '',
    updated_by: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const updateTypes = [
    { value: 'inward', label: 'Stock In (Received)', icon: TrendingUp, color: 'green', description: 'Add items to inventory' },
    { value: 'outward', label: 'Stock Out (Dispatched)', icon: TrendingDown, color: 'red', description: 'Remove items from inventory' },
    { value: 'adjustment', label: 'Stock Adjustment', icon: BarChart3, color: 'blue', description: 'Correct inventory discrepancies' }
  ];

  const reasons = {
    inward: [
      'Purchase Receipt',
      'Return from Customer',
      'Production',
      'Transfer In',
      'Initial Stock',
      'Other'
    ],
    outward: [
      'Sale',
      'Damaged/Expired',
      'Transfer Out',
      'Return to Supplier',
      'Sample/Demo',
      'Other'
    ],
    adjustment: [
      'Physical Count Correction',
      'System Error Fix',
      'Damage Write-off',
      'Theft/Loss',
      'Other'
    ]
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setUpdateData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleTypeChange = (type) => {
    setUpdateData(prev => ({
      ...prev,
      type,
      reason: '', // Reset reason when type changes
      quantity: 0
    }));
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!updateData.quantity || updateData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!updateData.reason) {
      newErrors.reason = 'Reason is required';
    }

    // Check if outward quantity exceeds available stock
    if (updateData.type === 'outward' && updateData.quantity > good.quantity) {
      newErrors.quantity = `Cannot dispatch ${updateData.quantity} items. Only ${good.quantity} available.`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateNewQuantity = () => {
    if (updateData.type === 'inward') {
      return good.quantity + updateData.quantity;
    } else if (updateData.type === 'outward') {
      return Math.max(0, good.quantity - updateData.quantity);
    } else {
      return updateData.quantity; // For adjustments, it's the new total
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showNotification('Please fix the form errors', 'error');
      return;
    }

    setLoading(true);

    try {
      const stockUpdate = {
        ...updateData,
        good_id: good.id,
        previous_quantity: good.quantity,
        new_quantity: calculateNewQuantity(),
        updated_at: new Date().toISOString()
      };

      await goodsAPI.updateStock(good.id, stockUpdate);
      
      const actionText = updateData.type === 'inward' ? 'added to' : 
                        updateData.type === 'outward' ? 'removed from' : 
                        'adjusted for';
      
      showNotification(
        `Stock successfully ${actionText} ${good.name}`, 
        'success'
      );

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update stock:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to update stock. Please try again.';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedType = updateTypes.find(type => type.value === updateData.type);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <BarChart3 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Update Stock</h2>
              <p className="text-sm text-gray-500">
                Current stock for <span className="font-medium">{good?.name}</span>: {good?.quantity} units
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
          {/* Stock Update Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Update Type</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {updateTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = updateData.type === type.value;
                
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      isSelected
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <Icon 
                        className={`w-5 h-5 mr-2 ${
                          isSelected ? `text-${type.color}-600` : 'text-gray-400'
                        }`} 
                      />
                      <span className={`font-medium ${
                        isSelected ? `text-${type.color}-900` : 'text-gray-700'
                      }`}>
                        {type.label}
                      </span>
                    </div>
                    <p className={`text-xs ${
                      isSelected ? `text-${type.color}-700` : 'text-gray-500'
                    }`}>
                      {type.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity and Reason */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="quantity"
                  value={updateData.quantity}
                  onChange={handleChange}
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.quantity ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter quantity"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {selectedType.value === 'inward' ? (
                    <Plus className="w-4 h-4 text-green-500" />
                  ) : selectedType.value === 'outward' ? (
                    <Minus className="w-4 h-4 text-red-500" />
                  ) : (
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                  )}
                </div>
              </div>
              {errors.quantity && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.quantity}
                </p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason *
              </label>
              <select
                name="reason"
                value={updateData.reason}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.reason ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select reason</option>
                {reasons[updateData.type]?.map(reason => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
              {errors.reason && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  {errors.reason}
                </p>
              )}
            </div>
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference Number
            </label>
            <input
              type="text"
              name="reference_number"
              value={updateData.reference_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="PO number, invoice number, etc. (optional)"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={updateData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any additional details about this stock update..."
            />
          </div>

          {/* Stock Preview */}
          <div className="bg-gray-50 rounded-lg p-4 border">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <Package className="w-4 h-4 mr-2" />
              Stock Update Preview
            </h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Current Stock:</span>
                <div className="font-medium">{good?.quantity} units</div>
              </div>
              <div>
                <span className="text-gray-500">
                  {updateData.type === 'adjustment' ? 'Adjustment:' : 'Change:'}
                </span>
                <div className={`font-medium ${
                  updateData.type === 'inward' ? 'text-green-600' : 
                  updateData.type === 'outward' ? 'text-red-600' : 
                  'text-blue-600'
                }`}>
                  {updateData.type === 'inward' && '+'}
                  {updateData.type === 'outward' && '-'}
                  {updateData.type === 'adjustment' && '→'}
                  {updateData.quantity} units
                </div>
              </div>
              <div>
                <span className="text-gray-500">New Stock:</span>
                <div className="font-medium text-gray-900">
                  {calculateNewQuantity()} units
                </div>
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
              {loading ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockUpdateModal;
