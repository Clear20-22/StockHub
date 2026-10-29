import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { mongoAssignmentsAPI, timeEntriesAPI, authAPI } from '../../services/api';
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  Download,
  RefreshCw,
  CheckCircle,
  Package,
  Target,
  Activity,
  AlertCircle,
  LogIn
} from 'lucide-react';

const PERIOD_LABELS = {
  week: { current: 'This Week', previous: 'last week' },
  month: { current: 'This Month', previous: 'last month' },
  quarter: { current: 'This Quarter', previous: 'last quarter' }
};

const CATEGORY_COLORS = [
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-gray-500'
];

const ACTIVITY_STYLES = {
  assignments: { icon: CheckCircle, color: 'text-green-600' },
  time: { icon: Clock, color: 'text-purple-600' },
  auth: { icon: LogIn, color: 'text-blue-600' },
  goods: { icon: Package, color: 'text-orange-600' }
};
const DEFAULT_ACTIVITY_STYLE = { icon: Activity, color: 'text-gray-600' };

const DAY_MS = 24 * 3600000;

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

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const dayKey = (date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const inRange = (date, range) => Boolean(date) && date >= range.start && date <= range.end;
const round1 = (value) => Math.round(value * 10) / 10;

/**
 * The selected period runs from its calendar start (Monday / 1st of month / 1st of quarter) until now.
 * The previous period covers the same elapsed time from the start of the previous week/month/quarter,
 * so "this week so far" is compared with "last week up to the same point".
 */
const getPeriodRanges = (period, now) => {
  let start;
  let previousStart;
  if (period === 'month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  } else if (period === 'quarter') {
    const quarterMonth = Math.floor(now.getMonth() / 3) * 3;
    start = new Date(now.getFullYear(), quarterMonth, 1);
    previousStart = new Date(now.getFullYear(), quarterMonth - 3, 1);
  } else {
    const today = startOfDay(now);
    const daysSinceMonday = (today.getDay() + 6) % 7;
    start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysSinceMonday);
    previousStart = new Date(start.getFullYear(), start.getMonth(), start.getDate() - 7);
  }
  const elapsed = now - start;
  // A shorter previous month is clipped so the two ranges never overlap
  const previousEnd = new Date(Math.min(previousStart.getTime() + elapsed, start.getTime() - 1));
  return {
    current: { start, end: now },
    previous: { start: previousStart, end: previousEnd }
  };
};

// Hours of a work entry; a running entry counts up to now
const entryHours = (entry, now) => {
  if (entry.type !== 'work') return 0;
  if (entry.status === 'active') {
    const start = parseTimestamp(entry.start_time);
    return start ? Math.max(0, (now - start) / 3600000) : 0;
  }
  const duration = Number(entry.duration_hours);
  if (entry.duration_hours !== null && entry.duration_hours !== undefined && Number.isFinite(duration)) {
    return Math.max(0, duration);
  }
  const start = parseTimestamp(entry.start_time);
  const end = parseTimestamp(entry.end_time);
  return start && end ? Math.max(0, (end - start) / 3600000) : 0;
};

/**
 * Efficiency = estimated hours / actual hours for completed tasks that have both (capped at 100%).
 * Returns null when no task has both values.
 */
const computeEfficiency = (completedTasks) => {
  let estimated = 0;
  let actual = 0;
  completedTasks.forEach((task) => {
    const est = Number(task.estimated_hours);
    const act = Number(task.actual_hours);
    if (Number.isFinite(est) && est > 0 && Number.isFinite(act) && act > 0) {
      estimated += est;
      actual += act;
    }
  });
  return actual > 0 ? Math.min(100, Math.round((estimated / actual) * 100)) : null;
};

/**
 * Metrics for one date range. Values are null when their source failed to load or there is nothing to measure.
 * - tasksCompleted: assignments whose completed_at falls in the range
 * - productivity: completed / (completed + assignments due in the range that were still open at its end) x 100
 * - hoursWorked: work-type time entries that started in the range
 */
const computeMetrics = (range, assignments, entries, now) => {
  const metrics = { productivity: null, tasksCompleted: null, hoursWorked: null, efficiency: null };

  if (assignments) {
    const completed = assignments.filter((a) => inRange(parseTimestamp(a.completed_at), range));
    const openDue = assignments.filter((a) => {
      if (a.status === 'cancelled') return false;
      if (!inRange(parseDueDate(a.due_date), range)) return false;
      const createdAt = parseTimestamp(a.created_at);
      if (createdAt && createdAt > range.end) return false;
      const completedAt = parseTimestamp(a.completed_at);
      return !completedAt || completedAt > range.end;
    });
    const denominator = completed.length + openDue.length;
    metrics.tasksCompleted = completed.length;
    metrics.productivity = denominator > 0 ? Math.round((completed.length / denominator) * 100) : null;
    metrics.efficiency = computeEfficiency(completed);
  }

  if (entries) {
    const hours = entries
      .filter((e) => inRange(parseTimestamp(e.start_time), range))
      .reduce((sum, e) => sum + entryHours(e, now), 0);
    metrics.hoursWorked = round1(hours);
  }

  return metrics;
};

// One row per local day from the period start through today
const buildDailySeries = (range, period, assignments, entries, now) => {
  const days = [];
  const index = {};
  for (let day = startOfDay(range.start); day <= range.end; day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)) {
    const row = {
      key: dayKey(day),
      date: day,
      day: period === 'week'
        ? day.toLocaleDateString(undefined, { weekday: 'short' })
        : day.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      hours: 0,
      tasks: 0,
      completedTasks: [],
      efficiency: null
    };
    index[row.key] = row;
    days.push(row);
  }

  (entries || []).forEach((entry) => {
    const start = parseTimestamp(entry.start_time);
    if (!inRange(start, range)) return;
    const row = index[dayKey(start)];
    if (row) row.hours += entryHours(entry, now);
  });

  (assignments || []).forEach((assignment) => {
    const completedAt = parseTimestamp(assignment.completed_at);
    if (!inRange(completedAt, range)) return;
    const row = index[dayKey(completedAt)];
    if (row) {
      row.tasks += 1;
      row.completedTasks.push(assignment);
    }
  });

  return days.map(({ completedTasks, ...row }) => ({
    ...row,
    hours: round1(row.hours),
    efficiency: computeEfficiency(completedTasks)
  }));
};

const buildTaskBreakdown = (range, assignments) => {
  const counts = {};
  (assignments || []).forEach((assignment) => {
    if (!inRange(parseTimestamp(assignment.completed_at), range)) return;
    const category = (assignment.category || '').trim() || 'Uncategorized';
    counts[category] = (counts[category] || 0) + 1;
  });
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([category, completed], i) => ({
      category,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      color: CATEGORY_COLORS[i % CATEGORY_COLORS.length]
    }));
};

const formatRelativeTime = (date, now = new Date()) => {
  if (!date) return '';
  const seconds = Math.round((now - date) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
};

const EMPTY_METRICS = { productivity: null, tasksCompleted: null, hoursWorked: null, efficiency: null };

const EmployeeReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [reportData, setReportData] = useState({ current: EMPTY_METRICS, previous: EMPTY_METRICS });

  const [dailyData, setDailyData] = useState([]);
  const [taskBreakdown, setTaskBreakdown] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  // Ignore responses from an earlier period if the user switches quickly
  const requestIdRef = useRef(0);

  const fetchReportData = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const ranges = getPeriodRanges(selectedPeriod, now);

      // One time-entry request covers both the previous and the current period
      const [assignmentsRes, entriesRes, activitiesRes] = await Promise.allSettled([
        mongoAssignmentsAPI.getMyAssignments(),
        timeEntriesAPI.getEntries({ start: ranges.previous.start.toISOString(), end: now.toISOString() }),
        authAPI.getMyActivities({ limit: 10 })
      ]);
      if (requestId !== requestIdRef.current) return;

      const failed = [];
      let assignments = null;
      let entries = null;

      if (assignmentsRes.status === 'fulfilled') {
        assignments = Array.isArray(assignmentsRes.value.data) ? assignmentsRes.value.data : [];
      } else {
        failed.push('assignments');
      }

      if (entriesRes.status === 'fulfilled') {
        entries = Array.isArray(entriesRes.value.data) ? entriesRes.value.data : [];
      } else {
        failed.push('time entries');
      }

      setReportData({
        current: computeMetrics(ranges.current, assignments, entries, now),
        previous: computeMetrics(ranges.previous, assignments, entries, now)
      });
      setDailyData(buildDailySeries(ranges.current, selectedPeriod, assignments, entries, now));
      setTaskBreakdown(buildTaskBreakdown(ranges.current, assignments));

      if (activitiesRes.status === 'fulfilled') {
        const activities = Array.isArray(activitiesRes.value.data) ? activitiesRes.value.data : [];
        setRecentActivities(activities.map((activity, i) => {
          const style = ACTIVITY_STYLES[activity.category] || DEFAULT_ACTIVITY_STYLE;
          return {
            id: activity.id || i,
            action: activity.description || activity.action || 'Activity',
            time: formatRelativeTime(parseTimestamp(activity.timestamp), now),
            type: activity.category || activity.action || 'activity',
            icon: style.icon,
            color: style.color
          };
        }));
      } else {
        failed.push('activities');
        setRecentActivities([]);
      }

      if (failed.length === 3) {
        setError('Failed to load report data. Please try again.');
      } else if (failed.length > 0) {
        setError(`Some report data could not be loaded (${failed.join(', ')}).`);
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;
      console.error('Error fetching report data:', error);
      setError('Failed to load report data. Please try again.');
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setInitialized(true);
      }
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  // Relative change in percent; null when there is nothing to compare against (avoids NaN / Infinity)
  const getPercentageChange = (current, previous) => {
    if (current === null || current === undefined || previous === null || previous === undefined) return null;
    if (previous === 0) return current === 0 ? 0 : null;
    return Math.round(((current - previous) / previous) * 1000) / 10;
  };

  const getTrend = (change) => {
    if (change === null) return null;
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'flat';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-600" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-500';
  };

  const previousLabel = PERIOD_LABELS[selectedPeriod]?.previous || 'previous period';

  // Comparison line under a KPI; "absolute" shows the raw difference (used for task counts)
  const renderComparison = (key, mode = 'percent') => {
    const current = reportData.current[key];
    const previous = reportData.previous[key];
    if (current === null || previous === null) {
      return <span className="text-xs text-gray-400">No data to compare with {previousLabel}</span>;
    }
    const change = mode === 'absolute' ? current - previous : getPercentageChange(current, previous);
    if (change === null) {
      // Previous value was 0, so a relative change is undefined
      return <span className="text-xs text-gray-400">No baseline from {previousLabel}</span>;
    }
    const trend = getTrend(change);
    const sign = change > 0 ? '+' : '';
    const formatted = mode === 'absolute' ? `${sign}${change}` : `${sign}${change}%`;
    return (
      <>
        {getTrendIcon(trend)}
        <span className={`text-sm ml-1 ${getTrendColor(trend)}`}>{formatted}</span>
        <span className="text-xs text-gray-400 ml-1">vs {previousLabel}</span>
      </>
    );
  };

  const formatValue = (value, suffix = '') => (value === null || value === undefined ? '—' : `${value}${suffix}`);

  // Client-side CSV of the KPIs and the per-day series currently on screen
  const handleExport = () => {
    const periodName = PERIOD_LABELS[selectedPeriod]?.current || selectedPeriod;
    const csvValue = (value) => (value === null || value === undefined ? '' : `"${String(value).replace(/"/g, '""')}"`);
    const lines = [
      ['Metric', periodName, `Previous (${previousLabel})`].map(csvValue).join(','),
      ...[
        ['Productivity (%)', 'productivity'],
        ['Tasks completed', 'tasksCompleted'],
        ['Hours worked', 'hoursWorked'],
        ['Efficiency (%)', 'efficiency']
      ].map(([label, key]) => [label, reportData.current[key], reportData.previous[key]].map(csvValue).join(',')),
      '',
      ['Date', 'Hours', 'Tasks completed', 'Efficiency (%)'].map(csvValue).join(','),
      ...dailyData.map((day) => [day.date.toLocaleDateString(), day.hours, day.tasks, day.efficiency].map(csvValue).join(','))
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `performance-report-${selectedPeriod}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading && !initialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  const maxDailyHours = Math.max(8, ...dailyData.map((day) => day.hours));
  const hasDailyData = dailyData.some((day) => day.hours > 0 || day.tasks > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mt-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Performance Reports</h1>
                <p className="text-gray-600 mt-1">Track your work performance and productivity</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
              <button
                onClick={fetchReportData}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-60"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleExport}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-60"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={fetchReportData}
              className="text-sm font-medium text-red-700 hover:text-red-800 underline ml-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Productivity</p>
                <p className="text-3xl font-bold text-gray-900">{formatValue(reportData.current.productivity, '%')}</p>
                <div className="flex items-center mt-2">
                  {renderComparison('productivity')}
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Completed vs. completed + overdue/open tasks due this period</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasks Completed</p>
                <p className="text-3xl font-bold text-gray-900">{formatValue(reportData.current.tasksCompleted)}</p>
                <div className="flex items-center mt-2">
                  {renderComparison('tasksCompleted', 'absolute')}
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hours Worked</p>
                <p className="text-3xl font-bold text-gray-900">{formatValue(reportData.current.hoursWorked, 'h')}</p>
                <div className="flex items-center mt-2">
                  {renderComparison('hoursWorked')}
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Efficiency</p>
                <p className="text-3xl font-bold text-gray-900">{formatValue(reportData.current.efficiency, '%')}</p>
                <div className="flex items-center mt-2">
                  {renderComparison('efficiency')}
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Estimated ÷ actual hours on completed tasks</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Performance Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Performance</h3>
            {!hasDailyData ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No work time logged or tasks completed yet this period</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {dailyData.map((day) => (
                  <div key={day.key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-16 text-sm font-medium text-gray-600">{day.day}</div>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(100, (day.hours / maxDailyHours) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{day.hours}h</div>
                      <div className="text-xs text-gray-500">
                        {day.tasks} task{day.tasks === 1 ? '' : 's'}
                        {day.efficiency !== null && ` · ${day.efficiency}% eff.`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Task Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Task Breakdown</h3>
            {taskBreakdown.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No tasks completed in this period</p>
              </div>
            ) : (
              <div className="space-y-4">
                {taskBreakdown.map((category) => (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                      <span className="text-sm font-medium text-gray-700">{category.category}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="bg-gray-200 rounded-full h-2 w-24">
                        <div
                          className={`h-2 rounded-full ${category.color}`}
                          style={{ width: `${category.percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8">{category.completed}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activities</h3>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent activity</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full bg-white ${activity.color}`}>
                    <activity.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {activity.type.replace(/[-_]/g, ' ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <button className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow text-left">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Detailed Analytics</h4>
                <p className="text-sm text-gray-600">View comprehensive performance analytics</p>
              </div>
            </div>
          </button>

          <button className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow text-left">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Set Goals</h4>
                <p className="text-sm text-gray-600">Define performance targets and goals</p>
              </div>
            </div>
          </button>

          <button className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-shadow text-left">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Schedule Review</h4>
                <p className="text-sm text-gray-600">Plan performance review meetings</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeReports;
