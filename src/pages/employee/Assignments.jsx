import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignmentsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { 
  ArrowLeft,
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Flag,
  MapPin,
  User,
  Building2,
  Filter,
  Search,
  RefreshCw,
  MoreVertical,
  Play,
  Pause,
  CheckSquare,
  Eye
} from 'lucide-react';

const EmployeeAssignments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      console.log('Fetching assignments for user:', user?.id);
      
      // Fetch assignments from the database
      const response = await assignmentsAPI.getMyAssignments();
      console.log('Assignments response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        // Transform the database data to match the component's expected format
        const transformedAssignments = response.data.map(assignment => {
          // Calculate completion percentage based on status
          let completion = 0;
          switch (assignment.status) {
            case 'completed':
              completion = 100;
              break;
            case 'in_progress':
              completion = assignment.progress || 50; // Use progress if available, otherwise default to 50%
              break;
            case 'pending':
              completion = 0;
              break;
            default:
              completion = 0;
          }

          return {
            id: assignment.id,
            title: assignment.task || 'Assignment Task',
            description: assignment.description || 'No description provided',
            priority: assignment.priority || 'medium',
            status: assignment.status || 'pending',
            dueDate: assignment.due_date ? new Date(assignment.due_date).toISOString().split('T')[0] : '2024-12-31',
            dueTime: assignment.due_date ? new Date(assignment.due_date).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) : '23:59',
            startDate: assignment.created_at ? new Date(assignment.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            branch: assignment.branch?.name || 'Main Warehouse',
            supervisor: assignment.supervisor || 'System Admin',
            completion: completion,
            estimatedHours: assignment.estimated_hours || 8,
            actualHours: assignment.actual_hours || 0,
            category: assignment.category || 'General'
          };
        });
        
        setAssignments(transformedAssignments);
      } else {
        console.warn('No assignments data received');
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
      showNotification('Failed to load assignments', 'error');
      
      // Optional: Set empty assignments instead of fallback data
      setAssignments([]);
      
      // If you want to show an error message to user
      if (error.response?.status === 401) {
        showNotification('Please log in to view your assignments', 'error');
        navigate('/auth');
      } else {
        showNotification('Unable to load assignments at the moment', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    const matchesFilter = filter === 'all' || assignment.status === filter;
    const matchesSearch = assignment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         assignment.category.toLowerCase().includes(searchTerm.toLowerCase());
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
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'scheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Play className="h-4 w-4" />;
      case 'pending': return <Pause className="h-4 w-4" />;
      case 'scheduled': return <Clock className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleStatusUpdate = async (assignmentId, newStatus) => {
    try {
      console.log(`Updating assignment ${assignmentId} to status ${newStatus}`);
      
      // Update the assignment status via API
      await assignmentsAPI.updateAssignment(assignmentId, { status: newStatus });
      
      // Update local state
      setAssignments(prev => prev.map(assignment => {
        if (assignment.id === assignmentId) {
          let completion = assignment.completion;
          // Update completion based on new status
          switch (newStatus) {
            case 'completed':
              completion = 100;
              break;
            case 'in_progress':
              completion = completion === 0 ? 50 : completion; // Start at 50% if was 0
              break;
            case 'pending':
              // Keep current completion
              break;
            default:
              // Keep current completion
              break;
          }
          
          return { ...assignment, status: newStatus, completion };
        }
        return assignment;
      }));
      
      showNotification(`Assignment status updated to ${newStatus.replace('-', ' ')}`, 'success');
    } catch (error) {
      console.error('Error updating assignment status:', error);
      showNotification('Failed to update assignment status', 'error');
    }
  };

  const getFilterCounts = () => {
    return {
      all: assignments.length,
      pending: assignments.filter(a => a.status === 'pending').length,
      'in-progress': assignments.filter(a => a.status === 'in-progress').length,
      completed: assignments.filter(a => a.status === 'completed').length,
      scheduled: assignments.filter(a => a.status === 'scheduled').length
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
      <div className="bg-white shadow-sm border-b border-gray-200 pt-24">
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
        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              { key: 'all', label: 'All Tasks', count: filterCounts.all },
              { key: 'pending', label: 'Pending', count: filterCounts.pending },
              { key: 'in-progress', label: 'In Progress', count: filterCounts['in-progress'] },
              { key: 'scheduled', label: 'Scheduled', count: filterCounts.scheduled },
              { key: 'completed', label: 'Completed', count: filterCounts.completed }
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
              <p className="text-gray-600">
                {filter === 'all' 
                  ? "You don't have any assignments yet." 
                  : `No assignments with status "${filter}".`
                }
              </p>
            </div>
          ) : (
            filteredAssignments.map((assignment) => (
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
                    <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>
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
                      <span className="ml-1 capitalize">{assignment.status.replace('-', ' ')}</span>
                    </span>
                    <span className="text-sm font-medium text-gray-900">{assignment.completion}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${assignment.completion}%` }}
                    ></div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()} at {assignment.dueTime}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Building2 className="h-4 w-4 mr-2" />
                    <span>{assignment.branch}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    <span>Supervisor: {assignment.supervisor}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{assignment.actualHours}h / {assignment.estimatedHours}h</span>
                  </div>
                </div>

                {/* Category Tag */}
                <div className="mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Flag className="h-3 w-3 mr-1" />
                    {assignment.category}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  {assignment.status === 'pending' && (
                    <button
                      onClick={() => handleStatusUpdate(assignment.id, 'in-progress')}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Start Task
                    </button>
                  )}
                  {assignment.status === 'in-progress' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(assignment.id, 'pending')}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors duration-200 text-sm font-medium"
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(assignment.id, 'completed')}
                        className="flex-1 flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </button>
                    </>
                  )}
                  {assignment.status === 'completed' && (
                    <button className="flex-1 flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium cursor-not-allowed">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Completed
                    </button>
                  )}
                  {assignment.status === 'scheduled' && (
                    <button className="flex-1 flex items-center justify-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                      <Clock className="h-4 w-4 mr-1" />
                      Scheduled
                    </button>
                  )}
                  <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200 text-sm font-medium">
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAssignments;
