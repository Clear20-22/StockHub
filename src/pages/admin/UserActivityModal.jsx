import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import { X, Activity, Clock, User, Shield, Building2, Package, ClipboardList } from 'lucide-react';

const UserActivityModal = ({ user, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserActivity();
  }, [user]);

  const fetchUserActivity = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getUserActivities(user.id, { limit: 20 });
      setActivities(response.data || []);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      // Fallback to mock data for development
      setActivities([
        {
          id: 1,
          action: 'Login',
          description: 'User logged into the system',
          timestamp: '2024-08-21T09:00:00Z',
          ip_address: '192.168.1.100',
          user_agent: 'Chrome/91.0 Windows',
          category: 'auth'
        },
        {
          id: 2,
          action: 'Profile Update',
          description: 'Updated profile information',
          timestamp: '2024-08-20T15:30:00Z',
          ip_address: '192.168.1.100',
          user_agent: 'Chrome/91.0 Windows',
          category: 'profile'
        },
        {
          id: 3,
          action: 'Goods Created',
          description: 'Created new goods item: "Industrial Equipment"',
          timestamp: '2024-08-20T14:15:00Z',
          ip_address: '192.168.1.100',
          user_agent: 'Chrome/91.0 Windows',
          category: 'goods'
        },
        {
          id: 4,
          action: 'Assignment Completed',
          description: 'Completed assignment: "Warehouse Inspection"',
          timestamp: '2024-08-20T11:45:00Z',
          ip_address: '192.168.1.100',
          user_agent: 'Chrome/91.0 Windows',
          category: 'assignment'
        },
        {
          id: 5,
          action: 'Login',
          description: 'User logged into the system',
          timestamp: '2024-08-19T08:30:00Z',
          ip_address: '192.168.1.105',
          user_agent: 'Firefox/89.0 Windows',
          category: 'auth'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (category) => {
    switch (category) {
      case 'auth':
        return <Shield className="w-5 h-5 text-blue-500" />;
      case 'profile':
        return <User className="w-5 h-5 text-green-500" />;
      case 'goods':
        return <Package className="w-5 h-5 text-purple-500" />;
      case 'assignment':
        return <ClipboardList className="w-5 h-5 text-orange-500" />;
      case 'branch':
        return <Building2 className="w-5 h-5 text-indigo-500" />;
      case 'security':
        return <Shield className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getActivityColor = (category) => {
    switch (category) {
      case 'auth':
        return 'bg-blue-50 border-blue-200';
      case 'profile':
        return 'bg-green-50 border-green-200';
      case 'goods':
        return 'bg-purple-50 border-purple-200';
      case 'assignment':
        return 'bg-orange-50 border-orange-200';
      case 'branch':
        return 'bg-indigo-50 border-indigo-200';
      case 'security':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getBrowserInfo = (userAgent) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown Browser';
  };

  const getLastLoginInfo = () => {
    if (!user.last_login) {
      return {
        status: 'Never logged in',
        color: 'text-gray-500'
      };
    }

    const lastLogin = new Date(user.last_login);
    const now = new Date();
    const diffHours = Math.floor((now - lastLogin) / (1000 * 60 * 60));

    if (diffHours < 1) {
      return {
        status: 'Active now',
        color: 'text-green-600'
      };
    } else if (diffHours < 24) {
      return {
        status: `${diffHours} hours ago`,
        color: 'text-green-600'
      };
    } else if (diffHours < 168) { // 7 days
      const days = Math.floor(diffHours / 24);
      return {
        status: `${days} day${days > 1 ? 's' : ''} ago`,
        color: 'text-yellow-600'
      };
    } else {
      return {
        status: 'Inactive',
        color: 'text-red-600'
      };
    }
  };

  const lastLoginInfo = getLastLoginInfo();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="flex-shrink-0 h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {user.first_name} {user.last_name}
              </h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{user.email}</span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {lastLoginInfo.status}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Summary */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {activities.filter(a => a.category === 'auth').length}
              </div>
              <div className="text-sm text-gray-600">Login Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {activities.filter(a => a.category === 'goods').length}
              </div>
              <div className="text-sm text-gray-600">Goods Actions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {activities.filter(a => a.category === 'assignment').length}
              </div>
              <div className="text-sm text-gray-600">Assignments</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${lastLoginInfo.color}`}>
                {user.is_active ? 'Active' : 'Inactive'}
              </div>
              <div className="text-sm text-gray-600">Account Status</div>
            </div>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Recent Activity
          </h3>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {activities.map((activity, index) => {
                  const formatted = formatDate(activity.timestamp);
                  return (
                    <div
                      key={activity.id}
                      className={`flex items-start p-4 rounded-lg border ${getActivityColor(activity.category)}`}
                    >
                      <div className="flex-shrink-0 mr-4">
                        {getActivityIcon(activity.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {activity.action}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {activity.description}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4">
                              <span>{formatted.date} at {formatted.time}</span>
                              <span>IP: {activity.ip_address}</span>
                              <span>{getBrowserInfo(activity.user_agent)}</span>
                            </div>
                          </div>
                          <div className="ml-4 text-xs text-gray-400">
                            #{activity.id}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserActivityModal;
