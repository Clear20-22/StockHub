import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, branchesAPI, assignmentsAPI } from '../../services/api';
import { useNotification } from '../../contexts/NotificationContext';
import SearchableSelect from '../../components/SearchableSelect';
import { 
  ArrowLeft,
  Plus,
  Search,
  User,
  Building2,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  AlertCircle,
  XCircle,
  Edit,
  Trash2,
  Filter,
  Users,
  Package,
  TrendingUp,
  RefreshCw,
  Download,
  FileText,
  Target
} from 'lucide-react';

const AdminAssignments = ({ onBack }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [assignments, setAssignments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // New assignment form data
  const [newAssignment, setNewAssignment] = useState({
    employee_id: '',
    branch_id: '',
    task: '',
    description: '',
    priority: 'medium',
    due_date: '',
    status: 'pending'
  });

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
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchAssignments();
    fetchEmployees();
    fetchBranches();
  }, []);

  const fetchAssignments = async () => {
    try {
      console.log('Fetching assignments...');
      setLoading(true);
      const response = await assignmentsAPI.getAssignments();
      console.log('Assignments fetched:', response.data);
      setAssignments(response.data || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      showNotification('Failed to fetch assignments', 'error');
      // Fallback to mock data
      const mockAssignments = [
        {
          id: 1,
          employee_id: 2,
          employee: { first_name: 'Jane', last_name: 'Smith' },
          branch_id: 1,
          branch: { name: 'Main Warehouse' },
          task: 'Warehouse Management',
          description: 'Oversee daily warehouse operations and manage inventory',
          status: 'in_progress',
          priority: 'high',
          due_date: '2024-12-31',
          created_at: '2024-01-10'
        }
      ];
      setAssignments(mockAssignments);
      console.log('Using fallback assignments data');
    } finally {
      setLoading(false);
      console.log('Finished fetching assignments');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await usersAPI.getUsers();
      console.log('Fetched users:', response.data);
      // Filter to get only employees (not customers or admins)
      const employeeUsers = response.data.filter(user => user.role === 'employee');
      console.log('Filtered employees:', employeeUsers);
      // Add display_name for searchable dropdown
      const employeesWithDisplayName = employeeUsers.map(employee => ({
        ...employee,
        display_name: `${employee.first_name} ${employee.last_name} (${employee.email})`
      }));
      setEmployees(employeesWithDisplayName);
      console.log('Set employees with display names:', employeesWithDisplayName);
    } catch (error) {
      console.error('Error fetching employees:', error);
      showNotification('Failed to fetch employees', 'error');
      // Fallback to mock data if API fails
      const mockEmployees = [
        { 
          id: 2, 
          first_name: 'Jane', 
          last_name: 'Smith', 
          email: 'jane@stockhub.com', 
          role: 'employee',
          display_name: 'Jane Smith (jane@stockhub.com)'
        },
        { 
          id: 4, 
          first_name: 'Mike', 
          last_name: 'Wilson', 
          email: 'mike@stockhub.com', 
          role: 'employee',
          display_name: 'Mike Wilson (mike@stockhub.com)'
        },
        { 
          id: 5, 
          first_name: 'Sarah', 
          last_name: 'Johnson', 
          email: 'sarah@stockhub.com', 
          role: 'employee',
          display_name: 'Sarah Johnson (sarah@stockhub.com)'
        }
      ];
      setEmployees(mockEmployees);
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      const response = await branchesAPI.getBranches();
      console.log('Fetched branches:', response.data);
      setBranches(response.data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      showNotification('Failed to fetch branches', 'error');
      // Fallback to mock data if API fails
      const mockBranches = [
        { id: 1, name: 'Main Warehouse' },
        { id: 2, name: 'Downtown Branch' },
        { id: 3, name: 'Northside Storage' }
      ];
      setBranches(mockBranches);
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const employeeName = assignment.employee ? `${assignment.employee.first_name} ${assignment.employee.last_name}` : '';
    const branchName = assignment.branch ? assignment.branch.name : '';
    const task = assignment.task || '';
    
    const matchesSearch = employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
    const matchesBranch = selectedBranch === 'all' || assignment.branch_id?.toString() === selectedBranch;
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const handleAddAssignment = async () => {
    // Validation
    if (!newAssignment.employee_id || !newAssignment.branch_id || !newAssignment.task || !newAssignment.due_date) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    setActionLoading(true);
    try {
      const assignmentData = {
        employee_id: parseInt(newAssignment.employee_id),
        branch_id: parseInt(newAssignment.branch_id),
        task: newAssignment.task,
        description: newAssignment.description || '',
        priority: newAssignment.priority || 'medium',
        due_date: newAssignment.due_date ? `${newAssignment.due_date}T23:59:59` : null,
        status: 'pending'
      };

      console.log('Submitting assignment data:', assignmentData);
      const response = await assignmentsAPI.createAssignment(assignmentData);
      console.log('Assignment created successfully:', response);
      
      showNotification('Assignment created successfully', 'success');
      
      // Reset form
      setNewAssignment({
        employee_id: '',
        branch_id: '',
        task: '',
        description: '',
        priority: 'medium',
        due_date: '',
        status: 'pending'
      });
      
      // Refresh assignments list
      console.log('Refreshing assignments list...');
      await fetchAssignments();
      console.log('Assignment form completed successfully');
    } catch (error) {
      console.error('Error adding assignment:', error);
      console.error('Error details:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMessage = error.response?.data?.detail || 'Failed to create assignment';
      showNotification(errorMessage, 'error');
    } finally {
      setActionLoading(false);
      // Always close the modal regardless of success or failure
      console.log('Closing assignment modal...');
      setShowAddModal(false);
    }
  };

  const handleEditAssignment = async () => {
    setActionLoading(true);
    try {
      // In real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const employee = employees.find(e => e.id === selectedAssignment.employee_id);
      const branch = branches.find(b => b.id === selectedAssignment.branch_id);
      
      setAssignments(assignments.map(assignment => 
        assignment.id === selectedAssignment.id 
          ? { 
              ...assignment, 
              ...selectedAssignment,
              employee: employee || assignment.employee,
              branch: branch || assignment.branch
            }
          : assignment
      ));
      setShowEditModal(false);
      setSelectedAssignment(null);
    } catch (error) {
      console.error('Error updating assignment:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      setActionLoading(true);
      try {
        // In real app, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setAssignments(assignments.filter(assignment => assignment.id !== assignmentId));
      } catch (error) {
        console.error('Error deleting assignment:', error);
      } finally {
        setActionLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj?.color || 'bg-gray-100 text-gray-800';
  };

  const calculateStats = () => {
    const totalAssignments = assignments.length;
    const activeAssignments = assignments.filter(a => a.status === 'active').length;
    const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
    const completedAssignments = assignments.filter(a => a.status === 'completed').length;

    return { totalAssignments, activeAssignments, pendingAssignments, completedAssignments };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Page Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 pt-24">
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
                <p className="text-sm font-medium text-gray-600">Active</p>
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
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
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
                onClick={fetchAssignments}
                className="w-full flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading assignments...</span>
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
                      Role
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
                  {filteredAssignments.map((assignment) => (
                    <tr key={assignment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {assignment.employee ? `${assignment.employee.first_name} ${assignment.employee.last_name}` : 'Unknown'}
                            </div>
                            <div className="text-sm text-gray-500">ID: {assignment.employee_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{assignment.task}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{assignment.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{assignment.branch?.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs">Created: {new Date(assignment.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs">Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                          {getStatusIcon(assignment.status)}
                          <span className="ml-1 capitalize">{assignment.status}</span>
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
                            style={{ width: `${assignment.progress || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{assignment.progress || 0}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedAssignment(assignment);
                              setShowEditModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAssignment(assignment.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAssignments.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Target className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new employee assignment.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowAddModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="-ml-1 mr-2 h-5 w-5" />
                      New Assignment
                    </button>
                  </div>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableSelect
                value={newAssignment.employee_id}
                onChange={(value) => setNewAssignment({...newAssignment, employee_id: value})}
                options={employees}
                placeholder="Select Employee"
                label="Employee"
                required
                displayKey="display_name"
                valueKey="id"
                searchKeys={["first_name", "last_name", "email"]}
                className=""
              />

              <SearchableSelect
                value={newAssignment.branch_id}
                onChange={(value) => setNewAssignment({...newAssignment, branch_id: value})}
                options={branches}
                placeholder="Select Branch"
                label="Branch"
                required
                displayKey="name"
                valueKey="id"
                searchKeys={["name"]}
                className=""
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task *</label>
                <input
                  type="text"
                  value={newAssignment.task}
                  onChange={(e) => setNewAssignment({...newAssignment, task: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newAssignment.priority}
                  onChange={(e) => setNewAssignment({...newAssignment, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  value={newAssignment.due_date}
                  onChange={(e) => setNewAssignment({...newAssignment, due_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={newAssignment.description}
                onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Describe the assignment responsibilities..."
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SearchableSelect
                value={selectedAssignment.employee_id}
                onChange={(value) => setSelectedAssignment({...selectedAssignment, employee_id: parseInt(value)})}
                options={employees}
                placeholder="Select Employee"
                label="Employee"
                displayKey="display_name"
                valueKey="id"
                searchKeys={["first_name", "last_name", "email"]}
                className=""
              />

              <SearchableSelect
                value={selectedAssignment.branch_id}
                onChange={(value) => setSelectedAssignment({...selectedAssignment, branch_id: parseInt(value)})}
                options={branches}
                placeholder="Select Branch"
                label="Branch"
                displayKey="name"
                valueKey="id"
                searchKeys={["name"]}
                className=""
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
                <input
                  type="text"
                  value={selectedAssignment.task || ''}
                  onChange={(e) => setSelectedAssignment({...selectedAssignment, task: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter task description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={selectedAssignment.status}
                  onChange={(e) => setSelectedAssignment({...selectedAssignment, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={selectedAssignment.priority}
                  onChange={(e) => setSelectedAssignment({...selectedAssignment, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={selectedAssignment.progress || 0}
                  onChange={(e) => setSelectedAssignment({...selectedAssignment, progress: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={selectedAssignment.due_date || ''}
                  onChange={(e) => setSelectedAssignment({...selectedAssignment, due_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={selectedAssignment.description}
                onChange={(e) => setSelectedAssignment({...selectedAssignment, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
