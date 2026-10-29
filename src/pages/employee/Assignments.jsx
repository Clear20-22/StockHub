import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Flag,
  User,
  Building2,
  Search,
  RefreshCw,
  MoreVertical,
  Play,
  Pause,
  CheckSquare,
  Eye
} from 'lucide-react';
import { mongoAssignmentsAPI, branchesAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled'
};

// Parse "YYYY-MM-DD" as a local date (new Date() would treat it as UTC and can shift the day)
const parseDate = (value) => {
  if (!value) return null;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = dateOnly ? new Date(`${value}T00:00:00`) : new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

const formatDue = (value) => {
  const date = parseDate(value);
  if (!date) return 'No due date';
  // Only show a time when the API sent one
  const hasTime = typeof value === 'string' && value.includes('T');
  const time = hasTime ? ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '';
  return `Due: ${date.toLocaleDateString()}${time}`;
};

const getErrorMessage = (error, fallback) => {
  const detail = error.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return fallback;
};

const EmployeeAssignments = () => {
  const navigate = useNavigate();
  const notify = useNotification();
  const [assignments, setAssignments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  // Guards against a second status update while one is in flight
  const updatingRef = useRef(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setLoadError(null);
      // Branch names are only cosmetic, so a branch failure should not block the task list
      const [assignmentsResult, branchesResult] = await Promise.allSettled([
        mongoAssignmentsAPI.getMyAssignments(),
        branchesAPI.getBranches()
      ]);

      if (assignmentsResult.status === 'rejected') {
        throw assignmentsResult.reason;
      }
      setAssignments(assignmentsResult.value.data || []);
      if (branchesResult.status === 'fulfilled') {
        setBranches(branchesResult.value.data || []);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      setLoadError(getErrorMessage(error, 'Failed to load your assignments.'));
    } finally {
      setLoading(false);
    }
  };

  const getBranchName = (branchId) => {
    if (branchId === null || branchId === undefined) return null;
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : `Branch #${branchId}`;
  };

  const filteredAssignments = assignments.filter(assignment => {
    const term = searchTerm.toLowerCase();
    const matchesFilter = filter === 'all' || assignment.status === filter;
    const matchesSearch = (assignment.title || '').toLowerCase().includes(term) ||
                         (assignment.description || '').toLowerCase().includes(term) ||
                         (assignment.category || '').toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'pending': return <Pause className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = async (assignmentId, newStatus) => {
    if (updatingRef.current) return;
    updatingRef.current = true;
    setUpdatingId(assignmentId);
    try {
      const data = { status: newStatus };
      if (newStatus === 'completed') data.progress = 100;
      const response = await mongoAssignmentsAPI.updateAssignment(assignmentId, data);
      setAssignments(prev => prev.map(assignment =>
        assignment.id === assignmentId ? response.data : assignment
      ));
      notify.success(`Task marked as ${STATUS_LABELS[newStatus].toLowerCase()}`);
    } catch (error) {
      console.error('Error updating assignment:', error);
      notify.error(getErrorMessage(error, 'Failed to update the task.'));
    } finally {
      updatingRef.current = false;
      setUpdatingId(null);
    }
  };

  const getFilterCounts = () => {
    return {
      all: assignments.length,
      pending: assignments.filter(a => a.status === 'pending').length,
      in_progress: assignments.filter(a => a.status === 'in_progress').length,
      completed: assignments.filter(a => a.status === 'completed').length,
      cancelled: assignments.filter(a => a.status === 'cancelled').length
    };
  };

  const filterCounts = getFilterCounts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your assignments...</p>
        </div>
      </div>
    );
  }

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
                <h1 className="text-3xl font-bold text-gray-900">My Assignments</h1>
                <p className="text-gray-600 mt-1">View and manage your assigned tasks</p>
              </div>
            </div>
            <button
              onClick={fetchAssignments}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loadError ? (
          <div className="bg-white rounded-xl shadow-sm border border-red-200 p-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Couldn't load assignments</h3>
            <p className="text-gray-600 mb-6">{loadError}</p>
            <button
              onClick={fetchAssignments}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { key: 'all', label: 'All Tasks', count: filterCounts.all },
                  { key: 'pending', label: 'Pending', count: filterCounts.pending },
                  { key: 'in_progress', label: 'In Progress', count: filterCounts.in_progress },
                  { key: 'completed', label: 'Completed', count: filterCounts.completed },
                  { key: 'cancelled', label: 'Cancelled', count: filterCounts.cancelled }
                ].map((filterOption) => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                      filter === filterOption.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filterOption.label} ({filterOption.count})
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAssignments.length === 0 ? (
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                  <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {assignments.length === 0 ? 'No assignments yet' : 'No assignments found'}
                  </h3>
                  <p className="text-gray-600">
                    {assignments.length === 0
                      ? "You don't have any assignments yet."
                      : filter === 'all'
                        ? 'No assignments match your search.'
                        : `No assignments with status "${STATUS_LABELS[filter]}".`
                    }
                  </p>
                </div>
              ) : (
                filteredAssignments.map((assignment) => {
                  const branchName = getBranchName(assignment.branch_id);
                  const isUpdating = updatingId === assignment.id;
                  return (
                  <div key={assignment.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-300">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(assignment.priority)}`}>
                            {assignment.priority}
                          </span>
                        </div>
                        {assignment.description && (
                          <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
                        )}
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>

                    {/* Status and Progress */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                          {getStatusIcon(assignment.status)}
                          <span className="ml-1">{STATUS_LABELS[assignment.status] || assignment.status}</span>
                        </span>
                        <span className="text-sm font-medium text-gray-900">{assignment.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${assignment.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>{formatDue(assignment.due_date)}</span>
                      </div>
                      {branchName && (
                        <div className="flex items-center text-gray-600">
                          <Building2 className="h-4 w-4 mr-2" />
                          <span>{branchName}</span>
                        </div>
                      )}
                      {assignment.created_by_name && (
                        <div className="flex items-center text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>Supervisor: {assignment.created_by_name}</span>
                        </div>
                      )}
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>
                          {assignment.estimated_hours != null
                            ? `${assignment.actual_hours || 0}h / ${assignment.estimated_hours}h`
                            : `${assignment.actual_hours || 0}h logged`}
                        </span>
                      </div>
                    </div>

                    {/* Category Tag */}
                    {assignment.category && (
                      <div className="mb-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <Flag className="h-3 w-3 mr-1" />
                          {assignment.category}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex space-x-2">
                      {assignment.status === 'pending' && (
                        <button
                          onClick={() => handleStatusUpdate(assignment.id, 'in_progress')}
                          disabled={updatingId !== null}
                          className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          {isUpdating ? 'Starting...' : 'Start Task'}
                        </button>
                      )}
                      {assignment.status === 'in_progress' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(assignment.id, 'pending')}
                            disabled={updatingId !== null}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Pause
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(assignment.id, 'completed')}
                            disabled={updatingId !== null}
                            className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors duration-200 text-sm font-medium"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {isUpdating ? 'Saving...' : 'Complete'}
                          </button>
                    </>
                  )}
                  {assignment.status === 'completed' && (
                    <button className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium cursor-not-allowed">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completed
                    </button>
                  )}
                  {assignment.status === 'cancelled' && (
                    <button className="flex-1 flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm font-medium cursor-not-allowed">
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancelled
                    </button>
                  )}
                  <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
              );
            })
          )}
        </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeAssignments;
