import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Download,
  User,
  Building2,
  Package,
  Calendar,
  Filter,
  Search,
  Plus,
  Trash2
} from 'lucide-react';
import customerApplicationService from '../../services/customerApplications';

const CustomerApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchApplications();
    fetchStats();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const params = statusFilter === 'all' ? {} : { status: statusFilter };
      const data = await customerApplicationService.getAllApplications(params);
      setApplications(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await customerApplicationService.getApplicationStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleViewApplication = (application) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const handleUpdateStatus = async (applicationId, status, notes = '') => {
    try {
      setUpdating(true);
      const updateData = { status };
      if (notes) {
        updateData.employee_notes = notes;
      }
      
      await customerApplicationService.updateApplication(applicationId, updateData);
      
      // Refresh the applications list and stats
      await fetchApplications();
      await fetchStats();
      
      // Close modal if open
      setShowModal(false);
      setSelectedApplication(null);
    } catch (err) {
      console.error('Error updating application:', err);
      alert(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'under_review':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'under_review':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const filteredApplications = applications.filter(app =>
    app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.item_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && applications.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Customer Applications</h1>
              <p className="text-gray-600 mt-1">Manage storage applications from customers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total_applications}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending_applications}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Under Review</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.under_review_applications}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved_applications}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected_applications}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No customer applications have been submitted yet.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Storage Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {application.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.email}
                            </div>
                            {application.is_business_account && (
                              <div className="text-xs text-blue-600 flex items-center">
                                <Building2 className="h-3 w-3 mr-1" />
                                {application.business_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Package className="h-4 w-4 text-gray-400 mr-2" />
                            {application.item_type}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {application.storage_type} • {application.estimated_volume}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(application.status)}>
                          {application.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(application.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewApplication(application)}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(application.id, 'under_review')}
                              disabled={updating}
                              className="text-blue-600 hover:text-blue-900 transition-colors disabled:opacity-50"
                              title="Mark as Under Review"
                            >
                              <AlertCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(application.id, 'approved')}
                              disabled={updating}
                              className="text-green-600 hover:text-green-900 transition-colors disabled:opacity-50"
                              title="Approve Application"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(application.id, 'rejected')}
                              disabled={updating}
                              className="text-red-600 hover:text-red-900 transition-colors disabled:opacity-50"
                              title="Reject Application"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Application Details Modal */}
      {showModal && selectedApplication && (
        <ApplicationModal
          application={selectedApplication}
          onClose={() => {
            setShowModal(false);
            setSelectedApplication(null);
          }}
          onUpdateStatus={handleUpdateStatus}
          updating={updating}
        />
      )}
    </div>
  );
};

// Application Details Modal Component
const ApplicationModal = ({ application, onClose, onUpdateStatus, updating }) => {
  const [notes, setNotes] = useState(application.employee_notes || '');

  const handleStatusUpdate = (status) => {
    onUpdateStatus(application.id, status, notes);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Application Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Personal Information</h4>
              <div>
                <label className="text-sm text-gray-500">Full Name</label>
                <p className="font-medium">{application.full_name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium">{application.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Phone</label>
                <p className="font-medium">{application.phone}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Address</label>
                <p className="font-medium">{application.address || 'Not provided'}</p>
              </div>
            </div>

            {/* Business Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Business Information</h4>
              <div>
                <label className="text-sm text-gray-500">Business Account</label>
                <p className="font-medium">{application.is_business_account ? 'Yes' : 'No'}</p>
              </div>
              {application.is_business_account && (
                <>
                  <div>
                    <label className="text-sm text-gray-500">Business Name</label>
                    <p className="font-medium">{application.business_name || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Business Type</label>
                    <p className="font-medium">{application.business_type || 'Not provided'}</p>
                  </div>
                </>
              )}
            </div>

            {/* Storage Requirements */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Storage Requirements</h4>
              <div>
                <label className="text-sm text-gray-500">Item Type</label>
                <p className="font-medium">{application.item_type}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Storage Type</label>
                <p className="font-medium">{application.storage_type}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Estimated Volume</label>
                <p className="font-medium">{application.estimated_volume || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Access Frequency</label>
                <p className="font-medium">{application.access_frequency || 'Not specified'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Storage Duration</label>
                <p className="font-medium">{application.storage_duration || 'Not specified'}</p>
              </div>
              {application.special_requirements && (
                <div>
                  <label className="text-sm text-gray-500">Special Requirements</label>
                  <p className="font-medium">{application.special_requirements}</p>
                </div>
              )}
            </div>

            {/* Additional Services */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Additional Services</h4>
              <div>
                <label className="text-sm text-gray-500">Insurance Required</label>
                <p className="font-medium">{application.insurance_required ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Packing Services</label>
                <p className="font-medium">{application.packing_services ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Transportation Needed</label>
                <p className="font-medium">{application.transportation_needed ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Documents</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {application.inventory_list_url && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm font-medium">Inventory List</span>
                    </div>
                    <a
                      href={application.inventory_list_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              )}
              {application.identification_doc_url && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium">Identification Document</span>
                    </div>
                    <a
                      href={application.identification_doc_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Employee Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add notes about this application..."
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Current Status:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              application.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
              application.status === 'approved' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {application.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {application.status === 'pending' && (
              <>
                <button
                  onClick={() => handleStatusUpdate('under_review')}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {updating ? 'Updating...' : 'Mark Under Review'}
                </button>
                <button
                  onClick={() => handleStatusUpdate('approved')}
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {updating ? 'Updating...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={updating}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {updating ? 'Updating...' : 'Reject'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerApplications;
