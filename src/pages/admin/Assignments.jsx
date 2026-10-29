import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  User,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  TrendingUp,
  RefreshCw,
  Download,
  Target,
  PlayCircle
} from 'lucide-react';
import { mongoAssignmentsAPI, usersAPI, branchesAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';

const emptyForm = {
  title: '',
  employeeId: '',
  branchId: '',
  role: '',
  category: '',
  startDate: '',
  endDate: '',
  estimatedHours: '',
  description: '',
  priority: 'medium',
  status: 'pending',
  progress: 0
};

const statuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' }
];

// Parse "YYYY-MM-DD" as a local date (new Date() would treat it as UTC and can shift the day)
const parseDate = (value) => {
  if (!value) return null;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = dateOnly ? new Date(`${value}T00:00:00`) : new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

const formatDate = (value) => {
  const date = parseDate(value);
  return date ? date.toLocaleDateString() : 'Not set';
};

// <input type="date"> needs YYYY-MM-DD; the API may send a full ISO string
const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

const getEmployeeName = (user) =>
  `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;

const getErrorMessage = (error, fallback) => {
  const detail = error.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  return fallback;
};

// API assignment -> form state
const toForm = (assignment) => ({
  title: assignment.title || '',
  employeeId: assignment.employee_id || '',
  branchId: assignment.branch_id != null ? String(assignment.branch_id) : '',
  role: assignment.role || '',
  category: assignment.category || '',
  startDate: toDateInput(assignment.start_date),
  endDate: toDateInput(assignment.due_date),
  estimatedHours: assignment.estimated_hours ?? '',
  description: assignment.description || '',
  priority: assignment.priority || 'medium',
  status: assignment.status || 'pending',
  progress: assignment.progress ?? 0
});

// Form state -> API payload
const toPayload = (form) => {
  const progress = parseInt(form.progress, 10);
  return {
    title: form.title.trim(),
    employee_id: form.employeeId,
    description: form.description.trim() || null,
    branch_id: form.branchId ? parseInt(form.branchId, 10) : null,
    role: form.role || null,
    category: form.category.trim() || null,
    priority: form.priority,
    status: form.status,
    start_date: form.startDate || null,
    due_date: form.endDate || null,
    estimated_hours: form.estimatedHours === '' ? null : Number(form.estimatedHours),
    progress: isNaN(progress) ? 0 : Math.min(100, Math.max(0, progress))
  };
};

const validateForm = (form) => {
  if (!form.title.trim()) return 'Please enter a title.';
  if (!form.employeeId) return 'Please select an employee.';
  if (form.startDate && form.endDate && form.endDate < form.startDate) {
    return 'End date cannot be before the start date.';
  }
  if (form.estimatedHours !== '' && (isNaN(Number(form.estimatedHours)) || Number(form.estimatedHours) < 0)) {
    return 'Estimated hours must be a positive number.';
  }
  return null;
};

const AdminAssignments = ({ onBack }) => {
  const navigate = useNavigate();
  const notify = useNotification();
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [loadWarning, setLoadWarning] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  // The assignment being edited (as returned by the API) and its form copy
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [actionLoading, setActionLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  // Guards against double submission while a create/update/delete is in flight
  const savingRef = useRef(false);

  // New assignment form data
  const [newAssignment, setNewAssignment] = useState(emptyForm);

  const roles = [
    'Warehouse Manager',
    'Inventory Specialist',
    'Picker/Packer',
    'Quality Control',
    'Shipping Coordinator',
    'Receiving Clerk',
    'Forklift Operator',
    'Data Entry Clerk'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setLoadError(null);
    const [assignmentsResult, employeesResult, branchesResult] = await Promise.allSettled([
      mongoAssignmentsAPI.getAssignments(),
      usersAPI.getUsers({ role: 'employee', limit: 500 }),
      branchesAPI.getBranches()
    ]);

    if (assignmentsResult.status === 'fulfilled') {
      setAssignments(assignmentsResult.value.data || []);
    } else {
      console.error('Error fetching assignments:', assignmentsResult.reason);
      setLoadError(getErrorMessage(assignmentsResult.reason, 'Failed to load assignments.'));
    }

    // Employees and branches only feed the pickers and labels, so report them without blocking the table
    const warnings = [];
    if (employeesResult.status === 'fulfilled') {
      setEmployees(employeesResult.value.data || []);
    } else {
      console.error('Error fetching employees:', employeesResult.reason);
      warnings.push(getErrorMessage(employeesResult.reason, 'Failed to load employees.'));
    }

    if (branchesResult.status === 'fulfilled') {
      setBranches(branchesResult.value.data || []);
    } else {
      console.error('Error fetching branches:', branchesResult.reason);
      warnings.push(getErrorMessage(branchesResult.reason, 'Failed to load branches.'));
    }
    setLoadWarning(warnings.length ? warnings.join(' ') : null);

    setLoading(false);
  };

  const getBranchName = (branchId) => {
    if (branchId === null || branchId === undefined) return '';
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.name : `Branch #${branchId}`;
  };

  const filteredAssignments = assignments.filter(assignment => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (assignment.employee_name || '').toLowerCase().includes(term) ||
                         (assignment.title || '').toLowerCase().includes(term) ||
                         getBranchName(assignment.branch_id).toLowerCase().includes(term) ||
                         (assignment.role || '').toLowerCase().includes(term);
    const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
    const matchesBranch = selectedBranch === 'all' || String(assignment.branch_id) === selectedBranch;

    return matchesSearch && matchesStatus && matchesBranch;
  });

  const handleAddAssignment = async () => {
    if (savingRef.current) return;
    const validationError = validateForm(newAssignment);
    if (validationError) {
      notify.error(validationError);
      return;
    }

    savingRef.current = true;
    setActionLoading(true);
    try {
      const response = await mongoAssignmentsAPI.createAssignment(toPayload(newAssignment));
      setAssignments(prev => [response.data, ...prev]);
      setShowAddModal(false);
      setNewAssignment(emptyForm);
      notify.success('Assignment created');
    } catch (error) {
      console.error('Error adding assignment:', error);
      notify.error(getErrorMessage(error, 'Failed to create the assignment.'));
    } finally {
      savingRef.current = false;
      setActionLoading(false);
    }
  };

  const openEditModal = (assignment) => {
    setSelectedAssignment(assignment);
    setEditForm(toForm(assignment));
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setSelectedAssignment(null);
  };

  const handleEditAssignment = async () => {
    if (savingRef.current) return;
    const validationError = validateForm(editForm);
    if (validationError) {
      notify.error(validationError);
      return;
    }

    // Only send fields that changed, so untouched values (e.g. a due date with a time) are kept as-is
    const original = toPayload(toForm(selectedAssignment));
    const updated = toPayload(editForm);
    const changes = Object.fromEntries(
      Object.entries(updated).filter(([key, value]) => value !== original[key])
    );
    if (Object.keys(changes).length === 0) {
      closeEditModal();
      return;
    }

    savingRef.current = true;
    setActionLoading(true);
    try {
      const response = await mongoAssignmentsAPI.updateAssignment(selectedAssignment.id, changes);
      setAssignments(prev => prev.map(assignment =>
        assignment.id === selectedAssignment.id ? response.data : assignment
      ));
      closeEditModal();
      notify.success('Assignment updated');
    } catch (error) {
      console.error('Error updating assignment:', error);
      notify.error(getErrorMessage(error, 'Failed to update the assignment.'));
    } finally {
      savingRef.current = false;
      setActionLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (savingRef.current) return;
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      savingRef.current = true;
      setDeletingId(assignmentId);
      try {
        await mongoAssignmentsAPI.deleteAssignment(assignmentId);
        setAssignments(prev => prev.filter(assignment => assignment.id !== assignmentId));
        notify.success('Assignment deleted');
      } catch (error) {
        console.error('Error deleting assignment:', error);
        notify.error(getErrorMessage(error, 'Failed to delete the assignment.'));
      } finally {
        savingRef.current = false;
        setDeletingId(null);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in_progress': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in_progress': return <PlayCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status) => statuses.find(s => s.value === status)?.label || status;

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj?.color || 'bg-gray-100 text-gray-800';
  };

  const calculateStats = () => {
    const totalAssignments = assignments.length;
    const activeAssignments = assignments.filter(a => a.status === 'in_progress').length;
    const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;

    return { totalAssignments, activeAssignments, pendingAssignments, completedAssignments };
  };

  const stats = calculateStats();

  // Active employees can receive new work; when editing, keep the current assignee selectable
  const getEmployeeOptions = (currentId, currentName) => {
    const options = employees
      .filter(employee => employee.is_active !== false || employee.id === currentId)
      .map(employee => ({ id: employee.id, name: getEmployeeName(employee) }));
    if (currentId && !options.some(option => option.id === currentId)) {
      options.push({ id: currentId, name: currentName || 'Current assignee' });
    }
    return options;
  };

  // Form fields shared by the add and edit modals
  const renderFormFields = (form, setForm, isEdit) => (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({...form, title: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g. Inventory count - Section A"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
          <select
            value={form.employeeId}
            onChange={(e) => setForm({...form, employeeId: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Employee</option>
            {getEmployeeOptions(isEdit ? selectedAssignment?.employee_id : null, selectedAssignment?.employee_name).map(employee => (
              <option key={employee.id} value={employee.id}>{employee.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
          <select
            value={form.branchId}
            onChange={(e) => setForm({...form, branchId: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">No Branch</option>
            {branches.map(branch => (
              <option key={branch.id} value={String(branch.id)}>{branch.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select
            value={form.role}
            onChange={(e) => setForm({...form, role: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select Role</option>
            {/* Keep a role that isn't in the preset list selectable */}
            {form.role && !roles.includes(form.role) && (
              <option value={form.role}>{form.role}</option>
            )}
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm({...form, category: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g. Inventory"
          />
        </div>

        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({...form, status: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            value={form.priority}
            onChange={(e) => setForm({...form, priority: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {priorities.map(priority => (
              <option key={priority.value} value={priority.value}>{priority.label}</option>
            ))}
          </select>
        </div>

        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={form.progress}
              onChange={(e) => setForm({...form, progress: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={form.estimatedHours}
            onChange={(e) => setForm({...form, estimatedHours: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({...form, startDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({...form, endDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({...form, description: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Describe the assignment responsibilities..."
        />
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 mt-18">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onBack ? onBack() : navigate('/admin/dashboard')}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Employee Assignments</h1>
                <p className="text-gray-600 mt-1">Manage employee roles and branch assignments</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Assignment
              </button>
              <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200">
                <Download className="mr-2 h-4 w-4" />
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeAssignments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedAssignments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
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

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            {/* Branch Filter */}
            <div>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Branches</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id.toString()}>{branch.name}</option>
                ))}
              </select>
            </div>

            {/* Refresh */}
            <div>
              <button
                onClick={fetchData}
                disabled={loading}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {loadWarning && !loading && (
          <div className="flex items-center bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-4 py-3 mb-6 text-sm">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{loadWarning}</span>
          </div>
        )}

        {/* Assignments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading assignments...</span>
            </div>
          ) : loadError ? (
            <div className="text-center py-12">
              <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Couldn't load assignments</h3>
              <p className="mt-1 text-sm text-gray-500">{loadError}</p>
              <div className="mt-6">
                <button
                  onClick={fetchData}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="-ml-1 mr-2 h-5 w-5" />
                  Try Again
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssignments.map((assignment) => {
                    const employee = employees.find(e => e.id === assignment.employee_id);
                    const branchName = getBranchName(assignment.branch_id);
                    return (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{assignment.employee_name}</div>
                            {employee?.email && (
                              <div className="text-sm text-gray-500">{employee.email}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{assignment.title}</div>
                        {assignment.role && (
                          <div className="text-sm text-gray-700">{assignment.role}</div>
                        )}
                        {assignment.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">{assignment.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {branchName ? (
                          <div className="flex items-center">
                            <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900">{branchName}</span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No branch</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs">{formatDate(assignment.start_date)}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs">{formatDate(assignment.due_date)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                          {getStatusIcon(assignment.status)}
                          <span className="ml-1">{getStatusLabel(assignment.status)}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
                          {assignment.priority.charAt(0).toUpperCase() + assignment.priority.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${assignment.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{assignment.progress}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(assignment)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            disabled={deletingId !== null}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50 p-1"
                          >
                            <Trash2 className={`h-4 w-4 ${deletingId === assignment.id ? 'animate-pulse' : ''}`} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredAssignments.length === 0 && (
                <div className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {assignments.length === 0 ? 'No assignments yet' : 'No assignments found'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {assignments.length === 0
                      ? 'Get started by creating a new employee assignment.'
                      : 'No assignments match your search or filters.'}
                  </p>
                  {assignments.length === 0 && (
                    <div className="mt-6">
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="-ml-1 mr-2 h-5 w-5" />
                        New Assignment
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Assignment</h3>

            {renderFormFields(newAssignment, setNewAssignment, false)}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={actionLoading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAssignment}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Creating...' : 'Create Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Assignment Modal */}
      {showEditModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-screen overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Assignment</h3>

            {renderFormFields(editForm, setEditForm, true)}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={closeEditModal}
                disabled={actionLoading}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEditAssignment}
                disabled={actionLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'Updating...' : 'Update Assignment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAssignments;
