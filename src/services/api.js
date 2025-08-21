import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  getCurrentUser: () => api.get('/api/users/me'),
};

// Users API
export const usersAPI = {
  getUsers: (params = {}) => api.get('/api/users', { params }),
  getUser: (id) => api.get(`/api/users/${id}`),
  createUser: (data) => api.post('/api/users', data),
  updateUser: (id, data) => api.put(`/api/users/${id}`, data),
  updateMe: (data) => api.put('/api/users/me', data),
  deleteUser: (id) => api.delete(`/api/users/${id}`),
  getUserActivities: (id, params = {}) => api.get(`/api/users/${id}/activities`, { params }),
  getDashboardStats: () => api.get('/api/users/dashboard/stats'),
};

// Goods API
export const goodsAPI = {
  getGoods: (params = {}) => api.get('/api/goods', { params }),
  getMyGoods: (params = {}) => api.get('/api/goods/my-goods', { params }),
  getGood: (id) => api.get(`/api/goods/${id}`),
  createGood: (data) => api.post('/api/goods', data),
  updateGood: (id, data) => api.put(`/api/goods/${id}`, data),
  deleteGood: (id) => api.delete(`/api/goods/${id}`),
  updateStock: (id, data) => api.put(`/api/goods/${id}/stock`, data),
  exportGoods: (params = {}) => api.get('/api/goods/export', { params, responseType: 'blob' }),
  importGoods: (data) => api.post('/api/goods/import', data),
};

// Branches API
export const branchesAPI = {
  getBranches: (params = {}) => api.get('/api/branches', { params }),
  getBranch: (id) => api.get(`/api/branches/${id}`),
  createBranch: (data) => api.post('/api/branches', data),
  updateBranch: (id, data) => api.put(`/api/branches/${id}`, data),
  deleteBranch: (id) => api.delete(`/api/branches/${id}`),
};

// Assignments API
export const assignmentsAPI = {
  getAssignments: (params = {}) => api.get('/api/assignments', { params }),
  getMyAssignments: (params = {}) => api.get('/api/assignments/my-assignments', { params }),
  getAssignment: (id) => api.get(`/api/assignments/${id}`),
  createAssignment: (data) => api.post('/api/assignments', data),
  updateAssignment: (id, data) => api.put(`/api/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/api/assignments/${id}`),
};

export default api;
