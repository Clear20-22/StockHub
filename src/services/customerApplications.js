import api from './api';

const APPLICATIONS_ENDPOINT = '/api/applications';

export const customerApplicationService = {
  // Submit a new application with files
  async submitApplication(applicationData, inventoryFile, identificationFile) {
    try {
      const formData = new FormData();
      
      // Add application data as JSON string
      formData.append('application_data', JSON.stringify(applicationData));
      
      // Add files if they exist
      if (inventoryFile) {
        formData.append('inventory_list', inventoryFile);
      }
      
      if (identificationFile) {
        formData.append('identification_doc', identificationFile);
      }
      
      const response = await api.post(`${APPLICATIONS_ENDPOINT}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to submit application');
    }
  },

  // Get all applications (Employee/Admin only)
  async getAllApplications(params = {}) {
    try {
      const response = await api.get(APPLICATIONS_ENDPOINT, { params });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch applications');
    }
  },

  // Get a specific application by ID
  async getApplication(applicationId) {
    try {
      const response = await api.get(`${APPLICATIONS_ENDPOINT}/${applicationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch application');
    }
  },

  // Update application status and notes
  async updateApplication(applicationId, updateData) {
    try {
      const response = await api.put(`${APPLICATIONS_ENDPOINT}/${applicationId}`, updateData);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to update application');
    }
  },

  // Delete application (Admin only)
  async deleteApplication(applicationId) {
    try {
      const response = await api.delete(`${APPLICATIONS_ENDPOINT}/${applicationId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to delete application');
    }
  },

  // Get application statistics
  async getApplicationStats() {
    try {
      const response = await api.get(`${APPLICATIONS_ENDPOINT}/stats/summary`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch application stats');
    }
  },

  // Filter applications by status
  async getApplicationsByStatus(status, skip = 0, limit = 100) {
    try {
      const response = await api.get(APPLICATIONS_ENDPOINT, {
        params: { status, skip, limit }
      });
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Failed to fetch applications by status');
    }
  }
};

export default customerApplicationService;
