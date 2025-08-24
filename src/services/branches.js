import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Branch API endpoints
export const branchAPI = {
  // Get all branches
  getAllBranches: async (skip = 0, limit = 100) => {
    try {
      const response = await api.get(`/branches/?skip=${skip}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching branches:', error);
      throw error;
    }
  },

  // Get branch by ID
  getBranchById: async (branchId) => {
    try {
      const response = await api.get(`/branches/${branchId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching branch:', error);
      throw error;
    }
  },

  // Create new branch
  createBranch: async (branchData) => {
    try {
      const response = await api.post('/branches/', branchData);
      return response.data;
    } catch (error) {
      console.error('Error creating branch:', error);
      throw error;
    }
  },

  // Update branch
  updateBranch: async (branchId, branchData) => {
    try {
      const response = await api.put(`/branches/${branchId}`, branchData);
      return response.data;
    } catch (error) {
      console.error('Error updating branch:', error);
      throw error;
    }
  },

  // Delete branch
  deleteBranch: async (branchId) => {
    try {
      const response = await api.delete(`/branches/${branchId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting branch:', error);
      throw error;
    }
  },

  // Update branch capacity and calculate available space
  updateBranchCapacity: async (branchId, capacity, usedSpace = 0) => {
    try {
      const availableSpace = capacity - usedSpace;
      const response = await api.put(`/branches/${branchId}`, {
        capacity,
        available_space: availableSpace
      });
      return response.data;
    } catch (error) {
      console.error('Error updating branch capacity:', error);
      throw error;
    }
  }
};

export default api;
