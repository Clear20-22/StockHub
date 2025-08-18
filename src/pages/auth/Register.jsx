import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Package, UserPlus, Eye, EyeOff, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    role: 'customer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const errors = {};

    // Username validation
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    const { confirmPassword, ...userData } = formData;
    const result = await register(userData);
    
    if (result.success) {
      alert('Registration successful! Please login with your credentials.');
      navigate('/login');
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
    
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: ''
      });
    }
  };

  const getFieldError = (fieldName) => {
    return fieldErrors[fieldName];
  };

  const getFieldClasses = (fieldName) => {
    const baseClasses = "appearance-none relative block w-full border placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10 shadow-sm transition-all duration-200";
    const errorClasses = "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50";
    const normalClasses = "border-gray-300 bg-white hover:bg-gray-50 focus:bg-white";
    
    return `${baseClasses} ${fieldErrors[fieldName] ? errorClasses : normalClasses}`;
  };

  return (
    <div className="min-h-screen flex pt-20">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-lg w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                <div className="relative bg-white p-4 rounded-full shadow-lg border border-blue-100">
                  <Package className="h-12 w-12 text-blue-600" />
                </div>
              </div>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Join StockHub
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Create your account to get started
            </p>
          </div>

          {/* Form */}
          <form className="bg-white shadow-xl rounded-2xl px-8 py-10 space-y-6 border border-gray-100" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2 animate-fade-in">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            <div className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="first_name" className="block text-sm font-semibold text-gray-700">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="first_name"
                      name="first_name"
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className={`${getFieldClasses('first_name')} pl-4 pr-4 py-3 text-sm hover:border-blue-300 focus:scale-[1.02]`}
                      placeholder="Enter first name"
                    />
                    {!getFieldError('first_name') && formData.first_name && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  {getFieldError('first_name') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center animate-shake">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {getFieldError('first_name')}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="last_name" className="block text-sm font-semibold text-gray-700">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="last_name"
                      name="last_name"
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`${getFieldClasses('last_name')} pl-4 pr-4 py-3 text-sm hover:border-blue-300 focus:scale-[1.02]`}
                      placeholder="Enter last name"
                    />
                    {!getFieldError('last_name') && formData.last_name && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  {getFieldError('last_name') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center animate-shake">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {getFieldError('last_name')}
                    </p>
                  )}
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className={`${getFieldClasses('username')} pl-4 pr-4 py-3 text-sm hover:border-blue-300 focus:scale-[1.02]`}
                    placeholder="Choose a unique username"
                  />
                  {!getFieldError('username') && formData.username && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                    </div>
                  )}
                </div>
                {getFieldError('username') && (
                  <p className="mt-1 text-sm text-red-600 flex items-center animate-shake">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {getFieldError('username')}
                  </p>
                )}
                <p className="text-xs text-gray-500">At least 3 characters long</p>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`${getFieldClasses('email')} pl-4 pr-4 py-3 text-sm hover:border-blue-300 focus:scale-[1.02]`}
                    placeholder="you@example.com"
                  />
                  {!getFieldError('email') && formData.email && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                    </div>
                  )}
                </div>
                {getFieldError('email') && (
                  <p className="mt-1 text-sm text-red-600 flex items-center animate-shake">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {getFieldError('email')}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                  Phone Number <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`${getFieldClasses('phone')} pl-4 pr-4 py-3 text-sm hover:border-blue-300 focus:scale-[1.02]`}
                    placeholder="+1 (555) 123-4567"
                  />
                  {!getFieldError('phone') && formData.phone && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                    </div>
                  )}
                </div>
                {getFieldError('phone') && (
                  <p className="mt-1 text-sm text-red-600 flex items-center animate-shake">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {getFieldError('phone')}
                  </p>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
                  Address <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <textarea
                    id="address"
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleChange}
                    className={`${getFieldClasses('address')} pl-4 pr-4 py-3 text-sm hover:border-blue-300 focus:scale-[1.02] resize-none`}
                    placeholder="Enter your address"
                  />
                  {!getFieldError('address') && formData.address && (
                    <div className="absolute top-3 right-0 pr-3 flex items-center">
                      <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                    </div>
                  )}
                </div>
                {getFieldError('address') && (
                  <p className="mt-1 text-sm text-red-600 flex items-center animate-shake">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {getFieldError('address')}
                  </p>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`${getFieldClasses('password')} pl-4 pr-12 py-3 text-sm hover:border-blue-300 focus:scale-[1.02]`}
                      placeholder="Create password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                    {!getFieldError('password') && formData.password && formData.password.length >= 6 && (
                      <div className="absolute inset-y-0 right-10 pr-3 flex items-center">
                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  {getFieldError('password') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center animate-shake">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {getFieldError('password')}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    At least 6 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`${getFieldClasses('confirmPassword')} pl-4 pr-12 py-3 text-sm hover:border-blue-300 focus:scale-[1.02]`}
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                    {!getFieldError('confirmPassword') && formData.confirmPassword && formData.password === formData.confirmPassword && (
                      <div className="absolute inset-y-0 right-10 pr-3 flex items-center">
                        <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  {getFieldError('confirmPassword') && (
                    <p className="mt-1 text-sm text-red-600 flex items-center animate-shake">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {getFieldError('confirmPassword')}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              >
                <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <UserPlus className="h-5 w-5 text-blue-300 group-hover:text-blue-200 transition-colors" />
                  )}
                </span>
                {loading ? 'Creating Your Account...' : 'Create Account'}
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors hover:underline"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-md text-center relative z-10">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-30 animate-pulse"></div>
            <UserPlus className="relative h-20 w-20 mx-auto text-blue-200" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Join StockHub
          </h1>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Start managing your warehouse like a professional
          </p>
          
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3 group">
              <div className="h-2 w-2 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></div>
              <span className="text-blue-100">Free to get started</span>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="h-2 w-2 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></div>
              <span className="text-blue-100">Intuitive dashboard interface</span>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="h-2 w-2 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></div>
              <span className="text-blue-100">Real-time inventory tracking</span>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="h-2 w-2 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></div>
              <span className="text-blue-100">24/7 customer support</span>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
            <p className="text-sm text-blue-100">
              <span className="font-semibold">Trusted by 10,000+</span> warehouse managers worldwide
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;