import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Package, LogIn, Eye, EyeOff, AlertCircle, UserPlus } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const validateForm = () => {
    const errors = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
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

    const result = await login(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Login failed. Please check your credentials.');
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
    
    // Clear general error when user types
    if (error) {
      setError('');
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
    <div className="min-h-screen flex">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:items-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white p-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-md text-center relative z-10">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-30 animate-pulse"></div>
            <LogIn className="relative h-20 w-20 mx-auto text-blue-200" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-xl text-blue-100 mb-8 leading-relaxed">
            Continue your warehouse management journey
          </p>
          
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3 group">
              <div className="h-2 w-2 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></div>
              <span className="text-blue-100">Real-time inventory updates</span>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="h-2 w-2 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></div>
              <span className="text-blue-100">Advanced analytics dashboard</span>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="h-2 w-2 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></div>
              <span className="text-blue-100">Multi-user role management</span>
            </div>
            <div className="flex items-center space-x-3 group">
              <div className="h-2 w-2 bg-blue-300 rounded-full group-hover:scale-150 transition-transform"></div>
              <span className="text-blue-100">Secure data protection</span>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
            <p className="text-sm text-blue-100">
              <span className="font-semibold">99.9% uptime</span> with enterprise-grade reliability
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
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
              Sign in to StockHub
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-500 transition-colors hover:underline"
              >
                Create one here
              </Link>
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
                    placeholder="Enter your username"
                    autoComplete="username"
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
              </div>

              {/* Password */}
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
                    placeholder="Enter your password"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center hover:scale-110 transition-transform"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                  {!getFieldError('password') && formData.password && (
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
                    <LogIn className="h-5 w-5 text-blue-300 group-hover:text-blue-200 transition-colors" />
                  )}
                </span>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>

            {/* Demo Accounts */}
            <div className="pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="text-sm font-semibold text-gray-700 mb-4 flex items-center justify-center space-x-2">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                  <span>Demo Accounts (for testing)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200 group">
                    <div className="font-bold text-blue-700 mb-1 group-hover:text-blue-800">Admin</div>
                    <div className="text-blue-600 font-mono bg-white/60 px-2 py-1 rounded">admin / admin123</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 hover:shadow-md transition-all duration-200 group">
                    <div className="font-bold text-green-700 mb-1 group-hover:text-green-800">Employee</div>
                    <div className="text-green-600 font-mono bg-white/60 px-2 py-1 rounded">employee1 / emp123</div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 hover:shadow-md transition-all duration-200 group">
                    <div className="font-bold text-purple-700 mb-1 group-hover:text-purple-800">Customer</div>
                    <div className="text-purple-600 font-mono bg-white/60 px-2 py-1 rounded">customer1 / cust123</div>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-500">
                  Click any account above to try the demo
                </p>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                New to StockHub?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-blue-600 hover:text-blue-500 transition-colors hover:underline"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;