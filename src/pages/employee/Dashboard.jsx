import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  mongoAssignmentsAPI,
  timeEntriesAPI,
  goodsAPI,
  applicationsAPI,
  branchesAPI
} from '../../services/api';
import {
  ClipboardList,
  Package,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  Activity,
  MapPin,
  User,
  ArrowUpRight,
  FileText
} from 'lucide-react';

// Goods are fetched in pages of 100 to count low-stock items; cap the scan to keep the dashboard fast
const GOODS_PAGE_SIZE = 100;
const MAX_GOODS_PAGES = 10;
const DEFAULT_LOW_STOCK_THRESHOLD = 10;

// The backend stores naive UTC datetimes; treat timestamps without an offset as UTC
const parseTimestamp = (value) => {
  if (!value || typeof value !== 'string') return null;
  const hasTime = value.includes('T');
  const hasOffset = /(Z|[+-]\d{2}:?\d{2})$/.test(value);
  const date = new Date(hasTime && !hasOffset ? `${value}Z` : value);
  return isNaN(date.getTime()) ? null : date;
};

// Due dates are calendar dates: use the YYYY-MM-DD part as a local date so it never shifts a day
const parseDueDate = (value) => {
  if (!value || typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match) return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

// Hours of a work entry that fall inside [rangeStart, now]; a running entry counts up to now
const workHoursSince = (entry, rangeStart, now) => {
  if (entry.type !== 'work') return 0;
  const start = parseTimestamp(entry.start_time);
  if (!start) return 0;
  const end = entry.status === 'active' ? now : parseTimestamp(entry.end_time);
  if (!end) return 0;
  const overlap = Math.min(end, now) - Math.max(start, rangeStart);
  return overlap > 0 ? overlap / 3600000 : 0;
};

// In progress first, then pending, then completed; ties broken by nearest due date
const STATUS_ORDER = { in_progress: 0, pending: 1, completed: 2, cancelled: 3 };
const sortAssignments = (list) => [...list].sort((a, b) => {
  const statusDiff = (STATUS_ORDER[a.status] ?? 4) - (STATUS_ORDER[b.status] ?? 4);
  if (statusDiff !== 0) return statusDiff;
  const aDue = parseDueDate(a.due_date)?.getTime() ?? Infinity;
  const bDue = parseDueDate(b.due_date)?.getTime() ?? Infinity;
  return aDue - bDue;
});

// Same rule as the admin goods page: quantity at or below the threshold (default 10)
const isLowStock = (good) => {
  const quantity = Number(good.quantity);
  if (good.quantity === null || good.quantity === undefined || !Number.isFinite(quantity)) return false;
  const rawThreshold = good.low_stock_threshold;
  const threshold = rawThreshold === null || rawThreshold === undefined || !Number.isFinite(Number(rawThreshold))
    ? DEFAULT_LOW_STOCK_THRESHOLD
    : Number(rawThreshold);
  return quantity <= threshold;
};

const formatStatus = (status = '') => {
  const label = status.replace('_', ' ');
  return label.charAt(0).toUpperCase() + label.slice(1);
};

const formatPrice = (value) => {
  const price = Number(value);
  return value !== null && value !== undefined && Number.isFinite(price) ? `$${price.toFixed(2)}` : '—';
};

// Numbers that failed to load are shown as a dash instead of a fake zero
const display = (value) => (value === null || value === undefined ? '—' : value);

const EMPTY_STATS = {
  activeAssignments: null,
  pendingAssignments: null,
  completedAssignments: null,
  overdueAssignments: 0,
  totalAssignments: 0,
  hoursToday: null,
  timerRunning: false,
  lowStockGoods: null,
  totalGoods: 0,
  goodsScanCapped: false,
  pendingApplications: null,
  underReviewApplications: 0
};

// Fetch every goods page (up to the cap) so the low-stock count covers the whole inventory
const fetchAllGoods = async () => {
  const firstPage = (await goodsAPI.getGoods({ page: 1, limit: GOODS_PAGE_SIZE })).data || {};
  const pageCount = firstPage.total_pages || 1;
  const pagesToFetch = Math.min(pageCount, MAX_GOODS_PAGES);
  const otherPages = await Promise.all(
    Array.from({ length: pagesToFetch - 1 }, (_, i) =>
      goodsAPI.getGoods({ page: i + 2, limit: GOODS_PAGE_SIZE }).then((res) => res.data?.goods || [])
    )
  );
  const firstGoods = firstPage.goods || [];
  return {
    goods: [...firstGoods, ...otherPages.flat()],
    total: firstPage.total ?? firstGoods.length,
    capped: pageCount > MAX_GOODS_PAGES
  };
};

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(EMPTY_STATS);

  const [assignments, setAssignments] = useState([]);
  const [recentGoods, setRecentGoods] = useState([]);
  const [branchName, setBranchName] = useState(null);

  const userBranchId = user?.branch_id;

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      // Start a day early so an entry that began yesterday and ran past midnight still counts
      const entriesStart = new Date(todayStart.getTime() - 24 * 3600000);

      // Independent calls run in parallel; one failure only blanks its own section
      const [assignmentsRes, entriesRes, activeRes, goodsRes, applicationsRes, branchesRes] = await Promise.allSettled([
        mongoAssignmentsAPI.getMyAssignments(),
        timeEntriesAPI.getEntries({ start: entriesStart.toISOString(), end: now.toISOString() }),
        timeEntriesAPI.getActive(),
        fetchAllGoods(),
        applicationsAPI.getStats(),
        branchesAPI.getBranches()
      ]);

      const failed = [];
      const nextStats = { ...EMPTY_STATS };

      // Assignments
      if (assignmentsRes.status === 'fulfilled') {
        const list = Array.isArray(assignmentsRes.value.data) ? assignmentsRes.value.data : [];
        const open = list.filter((a) => a.status === 'pending' || a.status === 'in_progress');
        nextStats.activeAssignments = list.filter((a) => a.status === 'in_progress').length;
        nextStats.pendingAssignments = list.filter((a) => a.status === 'pending').length;
        nextStats.completedAssignments = list.filter((a) => a.status === 'completed').length;
        nextStats.overdueAssignments = open.filter((a) => {
          const due = parseDueDate(a.due_date);
          return due && due < todayStart;
        }).length;
        nextStats.totalAssignments = list.length;
        setAssignments(sortAssignments(list.filter((a) => a.status !== 'cancelled')).slice(0, 5));
      } else {
        failed.push('assignments');
        setAssignments([]);
      }

      // Hours logged today (work entries only, including a running timer)
      if (entriesRes.status === 'fulfilled') {
        const entries = Array.isArray(entriesRes.value.data) ? [...entriesRes.value.data] : [];
        const active = activeRes.status === 'fulfilled' ? activeRes.value.data : null;
        // A timer started before the fetched range still counts for the part that ran today
        if (active && !entries.some((e) => e.id === active.id)) entries.push(active);
        const hours = entries.reduce((sum, entry) => sum + workHoursSince(entry, todayStart, now), 0);
        nextStats.hoursToday = Math.round(hours * 10) / 10;
        nextStats.timerRunning = Boolean(active);
      } else {
        failed.push('time entries');
      }

      // Goods: recent items (the API sorts newest first) and low-stock count
      if (goodsRes.status === 'fulfilled') {
        const { goods, total, capped } = goodsRes.value;
        nextStats.lowStockGoods = goods.filter(isLowStock).length;
        nextStats.totalGoods = total;
        nextStats.goodsScanCapped = capped;
        setRecentGoods(goods.slice(0, 5));
      } else {
        failed.push('goods');
        setRecentGoods([]);
      }

      // Customer applications awaiting a decision
      if (applicationsRes.status === 'fulfilled') {
        nextStats.pendingApplications = applicationsRes.value.data?.pending_applications ?? 0;
        nextStats.underReviewApplications = applicationsRes.value.data?.under_review_applications ?? 0;
      } else {
        failed.push('applications');
      }

      // Branch name for the header is optional, so a failure here is not reported
      if (branchesRes.status === 'fulfilled' && userBranchId !== null && userBranchId !== undefined) {
        const branches = Array.isArray(branchesRes.value.data) ? branchesRes.value.data : [];
        const branch = branches.find((b) => String(b.id) === String(userBranchId));
        setBranchName(branch ? branch.name : null);
      } else {
        setBranchName(null);
      }

      setStats(nextStats);
      if (failed.length > 0) {
        setError(`Some data could not be loaded (${failed.join(', ')}). Please try again later.`);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setStats(EMPTY_STATS);
    } finally {
      setLoading(false);
    }
  }, [userBranchId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const StatCard = ({ title, value, icon: Icon, color, description }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${color}`}>{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('-600', '-100')}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const quickActions = [
    {
      title: 'View My Tasks',
      description: 'Check assigned tasks and deadlines',
      icon: ClipboardList,
      color: 'from-blue-500 to-blue-600',
      action: () => navigate('/employee/assignments')
    },
    {
      title: 'Inventory Management',
      description: 'View and update inventory items',
      icon: Package,
      color: 'from-green-500 to-green-600',
      action: () => navigate('/employee/inventory')
    },
    {
      title: 'Time Tracker',
      description: 'Log work hours and breaks',
      icon: Clock,
      color: 'from-purple-500 to-purple-600',
      action: () => navigate('/employee/time-tracker')
    },
    {
      title: 'Reports',
      description: 'View performance and analytics',
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      action: () => navigate('/employee/reports')
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Employee Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.first_name || user?.username || 'Employee'}! Here's your work overview.</p>
          {branchName && (
            <p className="flex items-center text-sm text-gray-500 mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              {branchName}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="text-sm font-medium text-red-700 hover:text-red-800 underline ml-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Active Assignments"
            value={display(stats.activeAssignments)}
            icon={ClipboardList}
            color="text-blue-600"
            description={stats.activeAssignments === null ? 'Unavailable' : `${stats.totalAssignments} assigned in total`}
          />
          <StatCard
            title="Pending Tasks"
            value={display(stats.pendingAssignments)}
            icon={Clock}
            color="text-orange-600"
            description={stats.overdueAssignments > 0 ? `${stats.overdueAssignments} overdue` : 'Need attention'}
          />
          <StatCard
            title="Completed Tasks"
            value={display(stats.completedAssignments)}
            icon={CheckCircle}
            color="text-green-600"
            description={stats.completedAssignments > 0 ? 'Well done!' : 'All time'}
          />
          <StatCard
            title="Hours Today"
            value={stats.hoursToday === null ? '—' : `${stats.hoursToday}h`}
            icon={Activity}
            color="text-purple-600"
            description={stats.timerRunning ? 'Timer running' : 'Work time logged today'}
          />
          <StatCard
            title="Low Stock Items"
            value={display(stats.lowStockGoods)}
            icon={AlertTriangle}
            color="text-red-600"
            description={stats.lowStockGoods === null
              ? 'Unavailable'
              : `Of ${stats.totalGoods} goods${stats.goodsScanCapped ? ` (first ${GOODS_PAGE_SIZE * MAX_GOODS_PAGES} checked)` : ''}`}
          />
          <StatCard
            title="Pending Applications"
            value={display(stats.pendingApplications)}
            icon={FileText}
            color="text-yellow-600"
            description={stats.pendingApplications === null ? 'Unavailable' : `${stats.underReviewApplications} under review`}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 text-left group"
            >
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${action.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.description}</p>
              <ArrowUpRight className="h-4 w-4 text-gray-400 mt-2 group-hover:text-gray-600 transition-colors" />
            </button>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Assignments */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">My Assignments</h3>
              <button
                onClick={() => navigate('/employee/assignments')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>

            {assignments.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No assignments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const due = parseDueDate(assignment.due_date);
                  const isOpen = assignment.status === 'pending' || assignment.status === 'in_progress';
                  const now = new Date();
                  const isOverdue = isOpen && due && due < new Date(now.getFullYear(), now.getMonth(), now.getDate());
                  return (
                    <div key={assignment.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{assignment.title}</h4>
                          {assignment.description && (
                            <p className="text-sm text-gray-600 mb-2">{assignment.description}</p>
                          )}
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                              {formatStatus(assignment.status)}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                              {assignment.priority || 'medium'} priority
                            </span>
                          </div>
                        </div>
                        {isOpen && Number.isFinite(Number(assignment.progress)) && (
                          <span className="text-xs font-medium text-gray-500 ml-4">{Number(assignment.progress)}%</span>
                        )}
                      </div>
                      {due && (
                        <div className={`mt-2 text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                          Due: {due.toLocaleDateString()}{isOverdue ? ' (overdue)' : ''}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Goods */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Recent Goods</h3>
              <button
                onClick={() => navigate('/employee/inventory')}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>

            {recentGoods.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No goods found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentGoods.map((good) => (
                  <div key={good.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-1">{good.name || 'Unnamed item'}</h4>
                        <p className="text-sm text-gray-600 mb-2">{good.category || 'Uncategorized'}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${isLowStock(good) ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            Qty: {display(good.quantity)}{isLowStock(good) ? ' (low stock)' : ''}
                          </span>
                          <span className="text-sm font-medium text-green-600">{formatPrice(good.price_per_unit)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Additional Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Additional Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/employee/time-tracker')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 group"
            >
              <Clock className="w-8 h-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600">Time Tracker</p>
            </button>
            <button
              onClick={() => navigate('/employee/reports')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors duration-200 group"
            >
              <TrendingUp className="w-8 h-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-green-600">View Reports</p>
            </button>
            <button
              onClick={() => navigate('/employee/settings')}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors duration-200 group"
            >
              <User className="w-8 h-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-600 group-hover:text-purple-600">Settings</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
