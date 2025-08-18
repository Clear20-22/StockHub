import React, { useState, useEffect } from 'react';
import { Bell, Check, X, AlertTriangle, Info, CheckCircle, Clock, Trash2, Settings } from 'lucide-react';

const NotificationsPanel = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  // Sample notifications data
  useEffect(() => {
    const sampleNotifications = [
      {
        id: 1,
        type: 'success',
        title: 'Storage Confirmed',
        message: 'Your laptop computer has been successfully stored in location A-12-3.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: false,
        actionable: false
      },
      {
        id: 2,
        type: 'warning',
        title: 'Storage Expiring Soon',
        message: 'Your winter clothing storage will expire in 7 days. Renew now to avoid retrieval.',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        read: false,
        actionable: true,
        actionText: 'Renew Storage'
      },
      {
        id: 3,
        type: 'info',
        title: 'New Branch Opening',
        message: 'We\'re excited to announce our new branch in Seattle opening next month!',
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        read: true,
        actionable: false
      },
      {
        id: 4,
        type: 'alert',
        title: 'Payment Reminder',
        message: 'Your monthly storage fee of $45.00 is due in 3 days.',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        read: false,
        actionable: true,
        actionText: 'Pay Now'
      },
      {
        id: 5,
        type: 'success',
        title: 'Item Retrieved',
        message: 'Important documents have been successfully retrieved from location C-08-2.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        read: true,
        actionable: false
      },
      {
        id: 6,
        type: 'info',
        title: 'Maintenance Scheduled',
        message: 'Chicago branch will undergo maintenance on Saturday from 2-4 PM.',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        read: true,
        actionable: false
      }
    ];
    setNotifications(sampleNotifications);
  }, []);

  const getTypeIcon = (type) => {
    const icons = {
      success: <CheckCircle className="h-5 w-5 text-green-500" />,
      warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      alert: <AlertTriangle className="h-5 w-5 text-red-500" />,
      info: <Info className="h-5 w-5 text-blue-500" />
    };
    return icons[type] || <Bell className="h-5 w-5 text-gray-500" />;
  };

  const getTypeColor = (type) => {
    const colors = {
      success: 'border-l-green-500 bg-green-50',
      warning: 'border-l-yellow-500 bg-yellow-50',
      alert: 'border-l-red-500 bg-red-50',
      info: 'border-l-blue-500 bg-blue-50'
    };
    return colors[type] || 'border-l-gray-500 bg-gray-50';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes} minutes ago`;
    } else if (hours < 24) {
      return `${hours} hours ago`;
    } else {
      return `${days} days ago`;
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'actionable') return notif.actionable;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Notification Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'actionable', label: 'Action Required', count: notifications.filter(n => n.actionable).length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                filter === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1 text-xs ${
                  filter === tab.key ? 'text-blue-500' : 'text-gray-400'
                }`}>
                  ({tab.count})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              Mark all as read
            </button>
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-500">
              {filter === 'unread' ? 'All caught up! No unread notifications.' :
               filter === 'actionable' ? 'No actions required at this time.' :
               'You\'ll see notifications here when they arrive.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-l-4 ${getTypeColor(notification.type)} ${
                  !notification.read ? 'bg-opacity-100' : 'bg-opacity-50'
                } hover:bg-opacity-75 transition-colors`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className={`mt-1 text-sm ${!notification.read ? 'text-gray-700' : 'text-gray-500'}`}>
                        {notification.message}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          <span>{formatTimeAgo(notification.timestamp)}</span>
                        </div>
                        {notification.actionable && (
                          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors">
                            {notification.actionText}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete notification"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Notification Preferences</h3>
          <div className="space-y-2">
            {[
              { key: 'storage', label: 'Storage Updates', enabled: true },
              { key: 'payment', label: 'Payment Reminders', enabled: true },
              { key: 'maintenance', label: 'Maintenance Notices', enabled: false },
              { key: 'marketing', label: 'Promotional Offers', enabled: false }
            ].map(pref => (
              <label key={pref.key} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  defaultChecked={pref.enabled}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{pref.label}</span>
              </label>
            ))}
          </div>
          <button className="mt-3 text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors">
            Save Preferences
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;
