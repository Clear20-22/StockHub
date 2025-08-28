import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    employeeId: '',
    branchId: '',
    role: '',
    startDate: '',
    endDate: '',
    description: '',
    priority: 'medium'
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
      setLoading(true);
      // In real app, this would be an API call
      const mockAssignments = [
        {
          id: 1,
          employeeId: 2,
          employeeName: 'Jane Smith',
          branchId: 1,
          branchName: 'Main Warehouse',
          role: 'Warehouse Manager',
          startDate: '2024-01-15',
          endDate: '2024-12-31',
          status: 'active',
          priority: 'high',
          description: 'Oversee daily warehouse operations and manage inventory',
          createdAt: '2024-01-10',
          progress: 85
        },
        {
          id: 2,
          employeeId: 4,
          employeeName: 'Mike Wilson',
          branchId: 2,
          branchName: 'Downtown Branch',
          role: 'Inventory Specialist',
          startDate: '2024-02-01',
          endDate: '2024-06-30',
          status: 'active',
          priority: 'medium',
          description: 'Conduct weekly inventory audits and maintain stock accuracy',
          createdAt: '2024-01-25',
          progress: 60
        },
        {
          id: 3,
          employeeId: 5,
          employeeName: 'Sarah Johnson',
          branchId: 3,
          branchName: 'Northside Storage',
          role: 'Quality Control',
          startDate: '2024-01-20',
          endDate: '2024-03-20',
          status: 'completed',
          priority: 'medium',
          description: 'Quality inspection of incoming shipments',
          createdAt: '2024-01-15',
          progress: 100
        },
        {
          id: 4,
          employeeId: 6,
          employeeName: 'David Brown',
          branchId: 1,
          branchName: 'Main Warehouse',
          role: 'Forklift Operator',
          startDate: '2024-03-01',
          endDate: '2024-08-31',
          status: 'pending',
          priority: 'low',
          description: 'Material handling and warehouse equipment operation',
          createdAt: '2024-02-25',
          progress: 0
        },
        {
          id: 5,
          employeeId: 7,
          employeeName: 'Lisa Davis',
          branchId: 4,
          branchName: 'Eastside Hub',
          role: 'Shipping Coordinator',
          startDate: '2024-02-15',
          endDate: '2024-04-15',
          status: 'cancelled',
          priority: 'high',
          description: 'Coordinate outbound shipments and delivery schedules',
          createdAt: '2024-02-10',
          progress: 25
        }
      ];
      setAssignments(mockAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      // Mock employees data
      const mockEmployees = [
        { id: 2, name: 'Jane Smith', email: 'jane@stockhub.com' },
        { id: 4, name: 'Mike Wilson', email: 'mike@stockhub.com' },
        { id: 5, name: 'Sarah Johnson', email: 'sarah@stockhub.com' },
        { id: 6, name: 'David Brown', email: 'david@stockhub.com' },
        { id: 7, name: 'Lisa Davis', email: 'lisa@stockhub.com' },
        { id: 8, name: 'Tom Anderson', email: 'tom@stockhub.com' },
        { id: 9, name: 'Emily Wilson', email: 'emily@stockhub.com' }
      ];
      setEmployees(mockEmployees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchBranches = async () => {
    try {
      // Mock branches data
      const mockBranches = [
        { id: 1, name: 'Main Warehouse' },
        { id: 2, name: 'Downtown Branch' },
        { id: 3, name: 'Northside Storage' },
        { id: 4, name: 'Eastside Hub' }
      ];
      setBranches(mockBranches);
    } catch (error) {
      console.error('Error fetching branches:', error);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.role.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || assignment.status === selectedStatus;
    const matchesBranch = selectedBranch === 'all' || assignment.branchId.toString() === selectedBranch;
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const handleAddAssignment = async () => {
    setActionLoading(true);
    try {
      // In real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const employee = employees.find(e => e.id === parseInt(newAssignment.employeeId));
      const branch = branches.find(b => b.id === parseInt(newAssignment.branchId));
      
      const newAssignmentData = {
        id: assignments.length + 1,
        employeeId: parseInt(newAssignment.employeeId),
        employeeName: employee?.name || 'Unknown',
        branchId: parseInt(newAssignment.branchId),
        branchName: branch?.name || 'Unknown',
        role: newAssignment.role,
        startDate: newAssignment.startDate,
        endDate: newAssignment.endDate,
        status: 'pending',
        priority: newAssignment.priority,
        description: newAssignment.description,
        createdAt: new Date().toISOString().split('T')[0],
        progress: 0
      };
      
      setAssignments([...assignments, newAssignmentData]);
      setShowAddModal(false);
      setNewAssignment({
        employeeId: '',
        branchId: '',
        role: '',
        startDate: '',
        endDate: '',
        description: '',
        priority: 'medium'
      });
    } catch (error) {
      console.error('Error adding assignment:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditAssignment = async () => {
    setActionLoading(true);
    try {
      // In real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const employee = employees.find(e => e.id === selectedAssignment.employeeId);
      const branch = branches.find(b => b.id === selectedAssignment.branchId);
      
      setAssignments(assignments.map(assignment => 
        assignment.id === selectedAssignment.id 
          ? { 
              ...assignment, 
              ...selectedAssignment,
              employeeName: employee?.name || assignment.employeeName,
              branchName: branch?.name || assignment.branchName
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
                            <div className="text-sm font-medium text-gray-900">{assignment.employeeName}</div>
                            <div className="text-sm text-gray-500">ID: {assignment.employeeId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{assignment.role}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{assignment.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">{assignment.branchName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs">{new Date(assignment.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 text-gray-400 mr-1" />
                            <span className="text-xs">{new Date(assignment.endDate).toLocaleDateString()}</span>
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
                            style={{ width: `${assignment.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{assignment.progress}%</span>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={newAssignment.employeeId}
                  onChange={(e) => setNewAssignment({...newAssignment, employeeId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select
                  value={newAssignment.branchId}
                  onChange={(e) => setNewAssignment({...newAssignment, branchId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newAssignment.role}
                  onChange={(e) => setNewAssignment({...newAssignment, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newAssignment.startDate}
                  onChange={(e) => setNewAssignment({...newAssignment, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={newAssignment.endDate}
                  onChange={(e) => setNewAssignment({...newAssignment, endDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                <select
                  value={selectedAssignment.employeeId}
                  onChange={(e) => setSelectedAssignment({...selectedAssignment, employeeId: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select
                  value={selectedAssignment.branchId}
                  onChange={(e) => setSelectedAssignment({...selectedAssignment, branchId: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>{branch.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={selectedAssignment.role}
                  onChange={(e) => setSelectedAssignment({...selectedAssignment, role: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
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
                  value={selectedAssignment.progress}
                  onChange={(e) => setSelectedAssignment({...selectedAssignment, progress: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={selectedAssignment.startDate}
                  onChange={(e) => setSelectedAssignment({...selectedAssignment, startDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={selectedAssignment.endDate}
                  onChange={(e) => setSelectedAssignment({...selectedAssignment, endDate: e.target.value})}
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
