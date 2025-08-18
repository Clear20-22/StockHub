import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

// Import customer components
import DashboardSidebar from '../../components/customer/DashboardSidebar';
import DashboardHeader from '../../components/customer/DashboardHeader';
import OverviewSection from '../../components/customer/OverviewSection';
import StatisticsSection from '../../components/customer/StatisticsSection';
import GoodsTable from '../../components/customer/GoodsTable';
import BranchesSection from '../../components/customer/BranchesSection';
import NotificationsPanel from '../../components/customer/NotificationsPanel';
import AccountSettings from '../../components/customer/AccountSettings';

// 404 Not Found Component
const NotFoundPage = () => (
  <div className="flex flex-col items-center justify-center h-96">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
      <button 
        onClick={() => window.history.back()}
        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
);

const CustomerDashboardLayout = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Sample data for all components
  const [dashboardData] = useState({
    totalGoods: 12,
    activeBranches: 4,
    pendingActions: 3,
    storageUsed: 68,
    monthlyActivity: [
      { month: 'Jan', stored: 4, retrieved: 2 },
      { month: 'Feb', stored: 3, retrieved: 1 },
      { month: 'Mar', stored: 5, retrieved: 3 },
      { month: 'Apr', stored: 2, retrieved: 4 },
      { month: 'May', stored: 6, retrieved: 2 },
      { month: 'Jun', stored: 3, retrieved: 5 }
    ],
    recentActivity: [
      { id: 1, action: 'Stored', item: 'Laptop Computer', date: '2024-01-20', status: 'completed' },
      { id: 2, action: 'Retrieved', item: 'Winter Clothing', date: '2024-01-18', status: 'completed' },
      { id: 3, action: 'Stored', item: 'Office Supplies', date: '2024-01-15', status: 'pending' }
    ],
    goods: [
      {
        id: 1,
        name: 'Laptop Computer',
        category: 'Electronics',
        description: 'Dell XPS 15 laptop with 16GB RAM',
        quantity: 1,
        status: 'stored',
        storageDate: '2024-01-15',
        branch: 'New York',
        location: 'A-12-3',
        value: '$1,200'
      },
      {
        id: 2,
        name: 'Office Chair',
        category: 'Furniture',
        description: 'Ergonomic office chair with lumbar support',
        quantity: 2,
        status: 'stored',
        storageDate: '2024-01-10',
        branch: 'Los Angeles',
        location: 'B-05-1',
        value: '$450'
      },
      {
        id: 3,
        name: 'Important Documents',
        category: 'Documents',
        description: 'Legal documents and contracts',
        quantity: 1,
        status: 'retrieved',
        storageDate: '2024-01-01',
        retrievalDate: '2024-01-20',
        branch: 'Chicago',
        location: 'C-08-2',
        value: '$0'
      }
    ]
  });

  const handleGoodsAction = (action, item) => {
    console.log(`${action} action for item:`, item);
    // Implement goods actions here
  };

  // Get current page title based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('inventory')) return 'My Inventory';
    if (path.includes('branches')) return 'Branch Locations';
    if (path.includes('statistics')) return 'Statistics & Reports';
    if (path.includes('notifications')) return 'Notifications';
    if (path.includes('account')) return 'Account Settings';
    return 'Dashboard Overview';
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <DashboardSidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        user={user}
      />

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header */}
        <DashboardHeader
          user={user}
          pageTitle={getPageTitle()}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          showNotifications={showNotifications}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 overflow-auto">
          <Routes>
            {/* Dashboard Overview */}
            <Route 
              path="/" 
              element={
                <OverviewSection 
                  data={dashboardData}
                  onQuickAction={handleGoodsAction}
                />
              } 
            />
            
            {/* Inventory/Goods */}
            <Route 
              path="/inventory" 
              element={
                <GoodsTable 
                  goods={dashboardData.goods}
                  onView={(item) => handleGoodsAction('view', item)}
                  onEdit={(item) => handleGoodsAction('edit', item)}
                  onDelete={(item) => handleGoodsAction('delete', item)}
                />
              } 
            />
            
            {/* Branches */}
            <Route 
              path="/branches" 
              element={<BranchesSection />} 
            />
            
            {/* Statistics */}
            <Route 
              path="/statistics" 
              element={
                <StatisticsSection 
                  data={dashboardData}
                />
              } 
            />
            
            {/* Notifications */}
            <Route 
              path="/notifications" 
              element={<NotificationsPanel />} 
            />
            
            {/* Account Settings */}
            <Route 
              path="/account" 
              element={<AccountSettings />} 
            />
            
            {/* 404 Not Found */}
            <Route 
              path="*" 
              element={<NotFoundPage />} 
            />
          </Routes>
        </main>
      </div>

      {/* Notifications Overlay */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="w-96 bg-white h-full shadow-xl overflow-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-0">
              <NotificationsPanel />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboardLayout;
