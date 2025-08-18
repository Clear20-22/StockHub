import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardSidebar from '../../components/customer/DashboardSidebar';
import DashboardHeader from '../../components/customer/DashboardHeader';
import OverviewSection from '../../components/customer/OverviewSection';
import StatisticsSection from '../../components/customer/StatisticsSection';
import GoodsTable from '../../components/customer/GoodsTable';
import BranchesSection from '../../components/customer/BranchesSection';
import NotificationsPanel from '../../components/customer/NotificationsPanel';
import AccountSettings from '../../components/customer/AccountSettings';

const CustomerDashboard = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Sample data for demo
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      totalGoods: 127,
      activeBranches: 4,
      pendingActions: 3,
      storageUsage: 78.5
    },
    recentActivity: [
      { id: 1, action: 'Stored MacBook Pro', branch: 'New York Branch', date: '2025-08-19', status: 'completed' },
      { id: 2, action: 'Retrieved Office Chair', branch: 'LA Branch', date: '2025-08-18', status: 'completed' },
      { id: 3, action: 'Storage Request', branch: 'Chicago Branch', date: '2025-08-17', status: 'pending' },
      { id: 4, action: 'Stored iPhone 15', branch: 'New York Branch', date: '2025-08-16', status: 'completed' },
      { id: 5, action: 'Branch Transfer', branch: 'LA Branch', date: '2025-08-15', status: 'in-progress' }
    ],
    inventoryTrends: [
      { month: 'Jan', stored: 45, retrieved: 23 },
      { month: 'Feb', stored: 52, retrieved: 28 },
      { month: 'Mar', stored: 48, retrieved: 31 },
      { month: 'Apr', stored: 61, retrieved: 25 },
      { month: 'May', stored: 55, retrieved: 35 },
      { month: 'Jun', stored: 67, retrieved: 42 },
      { month: 'Jul', stored: 58, retrieved: 38 },
      { month: 'Aug', stored: 72, retrieved: 45 }
    ],
    branchUsage: [
      { name: 'New York', value: 35, color: '#3B82F6' },
      { name: 'Los Angeles', value: 28, color: '#10B981' },
      { name: 'Chicago', value: 22, color: '#F59E0B' },
      { name: 'Miami', value: 15, color: '#EF4444' }
    ]
  });

  useEffect(() => {
    // Simulate fetching notifications
    setNotifications([
      { id: 1, title: 'Storage Request Approved', message: 'Your storage request for Electronics has been approved', time: '2 min ago', type: 'success', unread: true },
      { id: 2, title: 'Branch Maintenance', message: 'NYC Branch will undergo maintenance on Aug 25', time: '1 hour ago', type: 'warning', unread: true },
      { id: 3, title: 'Storage Fee Due', message: 'Monthly storage fee is due in 3 days', time: '2 hours ago', type: 'info', unread: false },
      { id: 4, title: 'Item Retrieved', message: 'Your MacBook Pro was successfully retrieved', time: '1 day ago', type: 'success', unread: false },
    ]);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const unreadNotifications = notifications.filter(n => n.unread).length;

  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, unread: false }
          : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };

  const handleDeleteNotification = (notificationId) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const handleViewItem = (item) => {
    console.log('View item:', item);
    // Here you would typically navigate to a detailed view or open a modal
  };

  const handleEditItem = (item) => {
    console.log('Edit item:', item);
    // Here you would open an edit form or navigate to edit page
  };

  const handleDeleteItem = (item) => {
    console.log('Delete item:', item);
    // Here you would show a confirmation dialog and delete the item
    if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
      console.log('Item deleted');
    }
  };

  const handleUpdateProfile = (profileData) => {
    console.log('Update profile:', profileData);
    // Here you would send the data to your API
  };

  const handleChangePassword = (passwordData) => {
    console.log('Change password:', passwordData);
    // Here you would send the password change request to your API
  };

  const handleUpdateNotifications = (notificationSettings) => {
    console.log('Update notification settings:', notificationSettings);
    // Here you would save the notification preferences
  };

  const handleUpdateBilling = (billingData) => {
    console.log('Update billing:', billingData);
    // Here you would update billing information
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <OverviewSection data={dashboardData} />
            <StatisticsSection data={dashboardData} />
          </div>
        );
      case 'goods':
        return (
          <GoodsTable 
            goods={[]}
            loading={false}
            onView={handleViewItem}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        );
      case 'branches':
        return <BranchesSection branches={[]} />;
      case 'statistics':
        return <StatisticsSection data={dashboardData} expanded={true} />;
      case 'notifications':
        return (
          <NotificationsPanel 
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            onDeleteNotification={handleDeleteNotification}
          />
        );
      case 'settings':
        return (
          <AccountSettings 
            user={user}
            onUpdateProfile={handleUpdateProfile}
            onChangePassword={handleChangePassword}
            onUpdateNotifications={handleUpdateNotifications}
            onUpdateBilling={handleUpdateBilling}
          />
        );
      default:
        return (
          <div className="space-y-6">
            <OverviewSection data={dashboardData} />
            <StatisticsSection data={dashboardData} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        user={user}
      />
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header */}
        <DashboardHeader
          user={user}
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
          notifications={unreadNotifications}
          toggleNotifications={toggleNotifications}
          showNotifications={showNotifications}
          notificationsList={notifications}
        />
        
        {/* Main Dashboard Content */}
        <main className="flex-1 p-4 lg:p-6 xl:p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {renderActiveSection()}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 px-4 lg:px-6 xl:px-8 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-gray-600">
            <div className="mb-2 sm:mb-0">
              © 2025 StockHub. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Terms</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CustomerDashboard;
