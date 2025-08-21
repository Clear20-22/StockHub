import React, { useState } from 'react';
import { 
  FileText,
  Upload,
  Building2,
  Calendar,
  User,
  Phone,
  Mail,
  Package,
  DollarSign,
  ArrowLeft,
  CheckCircle,
  Clock,
  AlertCircle,
  Shield,
  Zap
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ApplyToStore = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    address: '',
    
    // Storage Requirements
    itemType: '',
    estimatedVolume: '',
    storageType: '',
    accessFrequency: '',
    storageDuration: '',
    specialRequirements: '',
    
    // Business Information (if applicable)
    businessName: '',
    businessType: '',
    isBusinessAccount: false,
    
    // Additional Services
    insuranceRequired: false,
    packingServices: false,
    transportationNeeded: false,
    
    // Files
    inventoryList: null,
    identificationDoc: null
  });
  
  const [loading, setLoading] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);

  const totalSteps = 4;

  const storageTypes = [
    { value: 'climate-controlled', label: 'Climate Controlled', description: 'Temperature and humidity controlled' },
    { value: 'standard', label: 'Standard Storage', description: 'Regular warehouse storage' },
    { value: 'outdoor', label: 'Outdoor Storage', description: 'For vehicles and large equipment' },
    { value: 'secure', label: 'High Security', description: 'Enhanced security for valuables' },
    { value: 'refrigerated', label: 'Refrigerated', description: 'Cold storage for perishables' }
  ];

  const itemTypes = [
    'Household Items', 'Business Inventory', 'Documents', 'Artwork', 
    'Electronics', 'Furniture', 'Vehicles', 'Industrial Equipment', 
    'Seasonal Items', 'Other'
  ];

  const accessFrequencies = [
    { value: 'daily', label: 'Daily', price: '+$50/month' },
    { value: 'weekly', label: 'Weekly', price: '+$25/month' },
    { value: 'monthly', label: 'Monthly', price: 'Standard' },
    { value: 'rarely', label: 'Rarely (6+ months)', price: '-$15/month' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files[0]
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000));
      setApplicationSubmitted(true);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setLoading(false);
    }
  };

  if (applicationSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h1>
            <p className="text-gray-600 mb-8">
              Thank you for your storage application. We'll review your request and contact you within 24-48 hours with next steps and pricing information.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <div className="text-left space-y-2 text-blue-800">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Review process (24-48 hours)</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Consultation call to discuss requirements</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Custom quote and contract preparation</span>
                </div>
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2 flex-shrink-0" />
                  <span>Storage space allocation and move-in scheduling</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/customer/dashboard')}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                Return to Dashboard
              </button>
              <button 
                onClick={() => navigate('/customer/branch-capacity')}
                className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                View Branch Capacity
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mt-18">
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
                <h1 className="text-3xl font-bold text-gray-900">Storage Application</h1>
                <p className="text-gray-600 mt-1">Apply for long-term storage solutions</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm font-medium text-gray-600">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Step Content */}
          <div className="p-8">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Personal Information</h2>
                  <p className="text-gray-600">Let's start with your basic information</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <User className="inline h-4 w-4 mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Building2 className="inline h-4 w-4 mr-1" />
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="isBusinessAccount"
                      id="isBusinessAccount"
                      checked={formData.isBusinessAccount}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isBusinessAccount" className="text-sm font-medium text-gray-700">
                      This is a business account
                    </label>
                  </div>

                  {formData.isBusinessAccount && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Business Name
                        </label>
                        <input
                          type="text"
                          name="businessName"
                          value={formData.businessName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter business name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Business Type
                        </label>
                        <select
                          name="businessType"
                          value={formData.businessType}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select business type</option>
                          <option value="retail">Retail</option>
                          <option value="manufacturing">Manufacturing</option>
                          <option value="ecommerce">E-commerce</option>
                          <option value="logistics">Logistics</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Storage Requirements */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Storage Requirements</h2>
                  <p className="text-gray-600">Tell us about what you need to store</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Package className="inline h-4 w-4 mr-1" />
                      Type of Items *
                    </label>
                    <select
                      name="itemType"
                      value={formData.itemType}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select item type</option>
                      {itemTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estimated Volume
                    </label>
                    <select
                      name="estimatedVolume"
                      value={formData.estimatedVolume}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select volume</option>
                      <option value="small">Small (5x5 ft / 25 sq ft)</option>
                      <option value="medium">Medium (10x10 ft / 100 sq ft)</option>
                      <option value="large">Large (10x20 ft / 200 sq ft)</option>
                      <option value="extra-large">Extra Large (20x20 ft / 400+ sq ft)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    <Shield className="inline h-4 w-4 mr-1" />
                    Storage Type *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {storageTypes.map(type => (
                      <div key={type.value} className="relative">
                        <input
                          type="radio"
                          name="storageType"
                          value={type.value}
                          id={type.value}
                          checked={formData.storageType === type.value}
                          onChange={handleInputChange}
                          className="sr-only"
                        />
                        <label 
                          htmlFor={type.value}
                          className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            formData.storageType === type.value 
                              ? 'border-blue-500 bg-blue-50 text-blue-900' 
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="font-semibold">{type.label}</div>
                          <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Access Frequency
                    </label>
                    <div className="space-y-2">
                      {accessFrequencies.map(freq => (
                        <div key={freq.value} className="flex items-center">
                          <input
                            type="radio"
                            name="accessFrequency"
                            value={freq.value}
                            id={freq.value}
                            checked={formData.accessFrequency === freq.value}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <label htmlFor={freq.value} className="ml-3 text-sm">
                            <span className="font-medium">{freq.label}</span>
                            <span className="text-gray-500 ml-2">{freq.price}</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Storage Duration
                    </label>
                    <select
                      name="storageDuration"
                      value={formData.storageDuration}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select duration</option>
                      <option value="1-3-months">1-3 months</option>
                      <option value="3-6-months">3-6 months</option>
                      <option value="6-12-months">6-12 months</option>
                      <option value="1-2-years">1-2 years</option>
                      <option value="long-term">Long-term (2+ years)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <AlertCircle className="inline h-4 w-4 mr-1" />
                    Special Requirements
                  </label>
                  <textarea
                    name="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Any special handling, security, or environmental requirements..."
                  />
                </div>
              </div>
            )}

            {/* Step 3: Additional Services */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Additional Services</h2>
                  <p className="text-gray-600">Select any additional services you might need</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors duration-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <input
                          type="checkbox"
                          name="insuranceRequired"
                          id="insuranceRequired"
                          checked={formData.insuranceRequired}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Shield className="h-6 w-6 text-blue-600" />
                        <label htmlFor="insuranceRequired" className="font-semibold text-gray-900">
                          Insurance Coverage
                        </label>
                      </div>
                      <p className="text-sm text-gray-600">
                        Protect your items with comprehensive insurance coverage up to $50,000.
                      </p>
                      <p className="text-sm font-medium text-blue-600 mt-2">+$25/month</p>
                    </div>

                    <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors duration-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <input
                          type="checkbox"
                          name="packingServices"
                          id="packingServices"
                          checked={formData.packingServices}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Package className="h-6 w-6 text-blue-600" />
                        <label htmlFor="packingServices" className="font-semibold text-gray-900">
                          Packing Services
                        </label>
                      </div>
                      <p className="text-sm text-gray-600">
                        Professional packing and unpacking services by our trained staff.
                      </p>
                      <p className="text-sm font-medium text-blue-600 mt-2">Starting at $150</p>
                    </div>

                    <div className="border-2 border-gray-200 rounded-lg p-6 hover:border-blue-300 transition-colors duration-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <input
                          type="checkbox"
                          name="transportationNeeded"
                          id="transportationNeeded"
                          checked={formData.transportationNeeded}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <Zap className="h-6 w-6 text-blue-600" />
                        <label htmlFor="transportationNeeded" className="font-semibold text-gray-900">
                          Transportation
                        </label>
                      </div>
                      <p className="text-sm text-gray-600">
                        We'll pick up your items and transport them to our secure facility.
                      </p>
                      <p className="text-sm font-medium text-blue-600 mt-2">Starting at $100</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-900 mb-4">Estimated Monthly Cost</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Base storage fee:</span>
                        <span className="font-medium">$89/month</span>
                      </div>
                      {formData.insuranceRequired && (
                        <div className="flex justify-between text-blue-700">
                          <span>Insurance coverage:</span>
                          <span className="font-medium">+$25/month</span>
                        </div>
                      )}
                      <div className="border-t border-blue-200 pt-2 flex justify-between font-semibold text-blue-900">
                        <span>Total monthly cost:</span>
                        <span>${89 + (formData.insuranceRequired ? 25 : 0)}/month</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Document Upload */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Document Upload</h2>
                  <p className="text-gray-600">Upload required documents to complete your application</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      <FileText className="inline h-4 w-4 mr-1" />
                      Inventory List (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                      <input
                        type="file"
                        name="inventoryList"
                        onChange={handleFileChange}
                        accept=".pdf,.doc,.docx,.txt,.xlsx"
                        className="hidden"
                        id="inventoryList"
                      />
                      <label htmlFor="inventoryList" className="cursor-pointer">
                        <span className="text-blue-600 font-medium">Click to upload</span>
                        <span className="text-gray-600"> or drag and drop</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">PDF, DOC, TXT, XLSX up to 10MB</p>
                      {formData.inventoryList && (
                        <p className="text-sm text-green-600 mt-2">✓ {formData.inventoryList.name}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      <User className="inline h-4 w-4 mr-1" />
                      Identification Document *
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                      <input
                        type="file"
                        name="identificationDoc"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        id="identificationDoc"
                        required
                      />
                      <label htmlFor="identificationDoc" className="cursor-pointer">
                        <span className="text-blue-600 font-medium">Click to upload</span>
                        <span className="text-gray-600"> or drag and drop</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">Driver's License, Passport, or State ID (PDF, JPG, PNG up to 5MB)</p>
                      {formData.identificationDoc && (
                        <p className="text-sm text-green-600 mt-2">✓ {formData.identificationDoc.name}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Application Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><span className="font-medium">Name:</span> {formData.fullName}</p>
                        <p><span className="font-medium">Email:</span> {formData.email}</p>
                        <p><span className="font-medium">Phone:</span> {formData.phone}</p>
                      </div>
                      <div>
                        <p><span className="font-medium">Item Type:</span> {formData.itemType}</p>
                        <p><span className="font-medium">Storage Type:</span> {formData.storageType}</p>
                        <p><span className="font-medium">Volume:</span> {formData.estimatedVolume}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-gray-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Previous
              </button>

              {currentStep < totalSteps ? (
                <button
                  onClick={nextStep}
                  className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Next Step
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-8 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyToStore;
