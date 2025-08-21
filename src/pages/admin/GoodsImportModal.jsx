import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { goodsAPI } from '../../services/api';
import { 
  X, 
  Upload, 
  Download, 
  FileText, 
  AlertCircle, 
  CheckCircle,
  Info,
  ArrowRight
} from 'lucide-react';

const GoodsImportModal = ({ isOpen, onClose, onSuccess }) => {
  const { showNotification } = useNotification();
  
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Import
  const [file, setFile] = useState(null);
  const [importData, setImportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationResults, setValidationResults] = useState({
    valid: [],
    errors: [],
    warnings: []
  });

  const csvTemplate = `name,category,sku,supplier,quantity,price_per_unit,batch_no,expiry_date,branch_id,low_stock_threshold
"Sample Product 1","Electronics","SKU001","Supplier A",100,29.99,"BATCH001","2024-12-31",1,10
"Sample Product 2","Clothing","SKU002","Supplier B",50,19.99,"BATCH002","2024-06-30",2,5
"Sample Product 3","Food & Beverages","SKU003","Supplier C",200,9.99,"BATCH003","2024-03-31",1,20`;

  const requiredFields = ['name', 'category', 'quantity', 'branch_id'];
  const optionalFields = ['sku', 'supplier', 'price_per_unit', 'batch_no', 'expiry_date', 'low_stock_threshold'];

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        showNotification('Please select a CSV file', 'error');
        return;
      }
      setFile(selectedFile);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'goods_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    showNotification('Template downloaded successfully', 'success');
  };

  const parseCSV = (csvText) => {
    const lines = csvText.split('\n');
    if (lines.length < 2) {
      throw new Error('CSV file must contain at least a header row and one data row');
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '') continue;

      const values = [];
      let currentValue = '';
      let insideQuotes = false;

      for (let j = 0; j < lines[i].length; j++) {
        const char = lines[i][j];
        if (char === '"' && (j === 0 || lines[i][j-1] === ',')) {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());

      const row = {};
      headers.forEach((header, index) => {
        let value = values[index] || '';
        value = value.replace(/^"|"$/g, ''); // Remove quotes
        row[header] = value;
      });

      data.push(row);
    }

    return data;
  };

  const validateData = (data) => {
    const results = {
      valid: [],
      errors: [],
      warnings: []
    };

    data.forEach((row, index) => {
      const rowErrors = [];
      const rowWarnings = [];

      // Check required fields
      requiredFields.forEach(field => {
        if (!row[field] || row[field].toString().trim() === '') {
          rowErrors.push(`${field} is required`);
        }
      });

      // Validate specific fields
      if (row.quantity && (isNaN(row.quantity) || parseInt(row.quantity) < 0)) {
        rowErrors.push('Quantity must be a non-negative number');
      }

      if (row.price_per_unit && (isNaN(row.price_per_unit) || parseFloat(row.price_per_unit) < 0)) {
        rowErrors.push('Price per unit must be a non-negative number');
      }

      if (row.branch_id && (isNaN(row.branch_id) || parseInt(row.branch_id) < 1)) {
        rowErrors.push('Branch ID must be a valid number');
      }

      if (row.expiry_date && row.expiry_date !== '') {
        const expiryDate = new Date(row.expiry_date);
        if (isNaN(expiryDate.getTime())) {
          rowErrors.push('Expiry date must be in valid format (YYYY-MM-DD)');
        } else if (expiryDate <= new Date()) {
          rowWarnings.push('Expiry date is in the past');
        }
      }

      // Generate product ID if not provided
      if (!row.product_id) {
        row.product_id = `PRD-${Date.now().toString().slice(-6)}-${index + 1}`;
        rowWarnings.push('Product ID auto-generated');
      }

      if (rowErrors.length > 0) {
        results.errors.push({
          row: index + 1,
          data: row,
          errors: rowErrors
        });
      } else {
        if (rowWarnings.length > 0) {
          results.warnings.push({
            row: index + 1,
            data: row,
            warnings: rowWarnings
          });
        }
        results.valid.push({
          row: index + 1,
          data: row
        });
      }
    });

    return results;
  };

  const handlePreview = async () => {
    if (!file) {
      showNotification('Please select a file first', 'error');
      return;
    }

    setLoading(true);
    try {
      const text = await file.text();
      const data = parseCSV(text);
      const validation = validateData(data);
      
      setImportData(data);
      setValidationResults(validation);
      setStep(2);
    } catch (error) {
      console.error('Error parsing CSV:', error);
      showNotification(error.message || 'Error parsing CSV file', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (validationResults.valid.length === 0) {
      showNotification('No valid records to import', 'error');
      return;
    }

    setLoading(true);
    try {
      const validData = validationResults.valid.map(item => item.data);
      await goodsAPI.importGoods(validData);
      
      showNotification(
        `Successfully imported ${validData.length} items${validationResults.errors.length > 0 ? ` (${validationResults.errors.length} errors skipped)` : ''}`, 
        'success'
      );
      
      onSuccess();
      setStep(3);
    } catch (error) {
      console.error('Error importing goods:', error);
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Failed to import goods. Please try again.';
      showNotification(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setFile(null);
    setImportData([]);
    setValidationResults({ valid: [], errors: [], warnings: [] });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <Upload className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Import Goods</h2>
              <p className="text-sm text-gray-500">
                {step === 1 && 'Upload CSV file to import goods'}
                {step === 2 && 'Review and validate import data'}
                {step === 3 && 'Import completed successfully'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {stepNum}
                </div>
                <span className={`ml-2 text-sm ${
                  step >= stepNum ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {stepNum === 1 && 'Upload'}
                  {stepNum === 2 && 'Preview'}
                  {stepNum === 3 && 'Import'}
                </span>
                {stepNum < 3 && (
                  <ArrowRight className="w-4 h-4 text-gray-400 ml-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Upload */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Import Instructions
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use CSV format with comma-separated values</li>
                  <li>• Required fields: name, category, quantity, branch_id</li>
                  <li>• Optional fields: sku, supplier, price_per_unit, batch_no, expiry_date, low_stock_threshold</li>
                  <li>• Use YYYY-MM-DD format for expiry dates</li>
                  <li>• Branch ID should match existing branch IDs in the system</li>
                </ul>
              </div>

              {/* Template Download */}
              <div className="text-center">
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download CSV Template
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  Download the template file to see the correct format
                </p>
              </div>

              {/* File Upload */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-gray-900">Select CSV file to upload</p>
                    <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
                  </div>
                  <div className="mt-4">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label
                      htmlFor="csv-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                  </div>
                  {file && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        Selected file: <span className="font-medium">{file.name}</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-end">
                <button
                  onClick={handlePreview}
                  disabled={!file || loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <ArrowRight className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Processing...' : 'Preview Data'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 2 && (
            <div className="space-y-6">
              {/* Validation Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-900">Valid Records</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {validationResults.valid.length}
                  </p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                    <span className="font-medium text-red-900">Errors</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {validationResults.errors.length}
                  </p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Info className="w-5 h-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-900">Warnings</span>
                  </div>
                  <p className="text-2xl font-bold text-yellow-600 mt-1">
                    {validationResults.warnings.length}
                  </p>
                </div>
              </div>

              {/* Errors */}
              {validationResults.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-medium text-red-900 mb-2">Errors (will be skipped)</h3>
                  <div className="max-h-32 overflow-y-auto">
                    {validationResults.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-800 mb-1">
                        <span className="font-medium">Row {error.row}:</span> {error.errors.join(', ')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Valid Data Preview */}
              {validationResults.valid.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <div className="px-4 py-2 bg-gray-50 border-b">
                    <h3 className="font-medium text-gray-900">Preview of Valid Records</h3>
                  </div>
                  <div className="overflow-x-auto max-h-64">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {validationResults.valid.slice(0, 5).map((item, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 text-sm text-gray-900">{item.data.name}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">{item.data.category}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">{item.data.quantity}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">${item.data.price_per_unit || '0.00'}</td>
                            <td className="px-3 py-2 text-sm text-gray-500">{item.data.branch_id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {validationResults.valid.length > 5 && (
                      <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50">
                        ... and {validationResults.valid.length - 5} more records
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={validationResults.valid.length === 0 || loading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {loading ? 'Importing...' : `Import ${validationResults.valid.length} Items`}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Import Completed!</h3>
                <p className="text-gray-600">
                  Your goods have been successfully imported into the system.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoodsImportModal;
