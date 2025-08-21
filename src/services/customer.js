import { api } from './api';

// Customer API endpoints
export const customerAPI = {
  // Get current customer profile
  getProfile: () => api.get('/api/users/me'),
  
  // Get customer's goods/items
  getMyGoods: () => api.get('/api/goods/my-goods'),
  
  // Get customer's orders/assignments
  getMyOrders: () => api.get('/api/assignments/my-orders'),
  
  // Update customer profile
  updateProfile: (data) => api.put('/api/users/me', data),
  
  // Get customer activity/history
  getActivity: () => api.get('/api/users/me/activity'),
  
  // Get customer statistics
  getStats: () => api.get('/api/users/me/stats'),
};

export default customerAPI;
