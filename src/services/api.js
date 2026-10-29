import axios from 'axios';

// Empty string = same origin (e.g. behind the nginx /api proxy in Docker)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

// Create axios instance; the auth token travels in an httpOnly cookie
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.skipAuthRedirect) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API - Updated to use MongoDB endpoints
export const authAPI = {
  login: (credentials) => api.post('/api/mongo/auth/login', credentials, { skipAuthRedirect: true }),
  logout: () => api.post('/api/mongo/auth/logout', null, { skipAuthRedirect: true }),
  register: (userData) => api.post('/api/mongo/auth/register', userData),
  // Used to check for an existing session, so a 401 here must not redirect
  getCurrentUser: () => api.get('/api/mongo/auth/me', { skipAuthRedirect: true }),
  getMyActivities: (params = {}) => api.get('/api/mongo/auth/me/activities', { params }),
};

// Users API
export const usersAPI = {
  getUsers: (params = {}) => api.get('/api/mongo/auth/admin/users', { params }), // MongoDB users endpoint; params.role filters
  getUser: (id) => api.get(`/api/mongo/auth/admin/users/${id}`), // MongoDB get user by ID
  createUser: (data) => api.post('/api/mongo/auth/admin/create-user', data), // MongoDB admin create user
  updateUser: (id, data) => api.put(`/api/mongo/auth/admin/users/${id}`, data), // MongoDB update user
  updateMe: (data) => api.put('/api/mongo/auth/me', data), // Own profile (MongoDB, where all users exist)
  deleteUser: (id) => api.delete(`/api/mongo/auth/admin/users/${id}`), // MongoDB delete user
  toggleUserStatus: (id) => api.patch(`/api/mongo/auth/admin/users/${id}/toggle-active`), // Toggle active status
  getUserActivities: (id, params = {}) => api.get(`/api/users/${id}/activities`, { params }), // Keep SQLite for activities
  getDashboardStats: () => api.get('/api/users/dashboard/stats'), // Keep SQLite for dashboard stats
};

// Goods API - Using MongoDB endpoints
export const goodsAPI = {
  getGoods: (params = {}) => api.get('/api/mongo/goods', { params }),
  getMyGoods: (params = {}) => api.get('/api/mongo/goods/my-goods', { params }),
  // Customer storage request: { name, description, category, value, storage_date, special_instructions }
  requestStorage: (data) => api.post('/api/mongo/goods/my-goods', data),
  getGood: (id) => api.get(`/api/mongo/goods/${id}`),
  createGood: (data) => api.post('/api/mongo/goods', data),
  updateGood: (id, data) => api.put(`/api/mongo/goods/${id}`, data),
  deleteGood: (id) => api.delete(`/api/mongo/goods/${id}`),
  updateStock: (id, data) => api.put(`/api/mongo/goods/${id}/stock`, data),
  exportGoods: (params = {}) => api.get('/api/mongo/goods/export', { params, responseType: 'blob' }),
  importGoods: (data) => api.post('/api/mongo/goods/import', data),
};

// Branches API
export const branchesAPI = {
  getBranches: (params = {}) => api.get('/api/branches', { params }),
  getBranch: (id) => api.get(`/api/branches/${id}`),
  createBranch: (data) => api.post('/api/branches', data),
  updateBranch: (id, data) => api.put(`/api/branches/${id}`, data),
  deleteBranch: (id) => api.delete(`/api/branches/${id}`),
};

// Assignments API (MongoDB): admins see/manage all, employees see their own
// and may update status, progress and actual_hours
export const mongoAssignmentsAPI = {
  getAssignments: (params = {}) => api.get('/api/mongo/assignments/', { params }),
  getMyAssignments: () => api.get('/api/mongo/assignments/my'),
  createAssignment: (data) => api.post('/api/mongo/assignments/', data),
  updateAssignment: (id, data) => api.put(`/api/mongo/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/api/mongo/assignments/${id}`),
};

// Time tracking API (MongoDB) for the logged-in employee
export const timeEntriesAPI = {
  // params: { start, end } as ISO datetimes
  getEntries: (params = {}) => api.get('/api/mongo/time-entries/', { params }),
  getActive: () => api.get('/api/mongo/time-entries/active'),
  start: (data) => api.post('/api/mongo/time-entries/start', data),
  stop: (id) => api.post(`/api/mongo/time-entries/${id}/stop`),
};

// Customer applications API (employee/admin review)
export const applicationsAPI = {
  getApplications: (params = {}) => api.get('/api/applications/', { params }),
  getStats: () => api.get('/api/applications/stats/summary'),
};

// Legacy SQLite assignments API
export const assignmentsAPI = {
  getAssignments: (params = {}) => api.get('/api/assignments', { params }),
  getMyAssignments: (params = {}) => api.get('/api/assignments/my-assignments', { params }),
  getAssignment: (id) => api.get(`/api/assignments/${id}`),
  createAssignment: (data) => api.post('/api/assignments', data),
  updateAssignment: (id, data) => api.put(`/api/assignments/${id}`, data),
  deleteAssignment: (id) => api.delete(`/api/assignments/${id}`),
};

export default api;
