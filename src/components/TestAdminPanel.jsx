import React, { useState } from 'react';
import { usersAPI } from '../../services/api';

const TestAdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const testCreateAndFetch = async () => {
    try {
      setLoading(true);
      setMessage('Testing user creation and auto-refresh...');

      // 1. Create a new user
      const newUser = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'testpass123',
        role: 'employee',
        first_name: 'Test',
        last_name: 'User',
        phone: '+1234567890',
        address: '123 Test St'
      };

      const createResponse = await usersAPI.createUser(newUser);
      console.log('User created:', createResponse.data);
      setMessage('✅ User created! Now fetching updated list...');

      // 2. Fetch updated users list (should show new user at top)
      const usersResponse = await usersAPI.getUsers();
      console.log('Users fetched:', usersResponse.data);
      setUsers(usersResponse.data);
      setMessage(`✅ Complete! Found ${usersResponse.data.length} users, newest first.`);

    } catch (error) {
      console.error('Test failed:', error);
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsersOnly = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getUsers();
      setUsers(response.data);
      setMessage(`✅ Fetched ${response.data.length} users (sorted by creation time)`);
    } catch (error) {
      console.error('Fetch failed:', error);
      setMessage(`❌ Fetch error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">Admin Users API Test</h2>
      
      <div className="space-x-4 mb-4">
        <button
          onClick={testCreateAndFetch}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Create + Auto-Refresh'}
        </button>
        
        <button
          onClick={fetchUsersOnly}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Fetching...' : 'Fetch Users Only'}
        </button>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          {message}
        </div>
      )}

      {users.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Users (Newest First):</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 border text-left">Username</th>
                  <th className="px-4 py-2 border text-left">Name</th>
                  <th className="px-4 py-2 border text-left">Email</th>
                  <th className="px-4 py-2 border text-left">Role</th>
                  <th className="px-4 py-2 border text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id} className={index === 0 ? 'bg-green-50' : ''}>
                    <td className="px-4 py-2 border">{user.username}</td>
                    <td className="px-4 py-2 border">{user.first_name} {user.last_name}</td>
                    <td className="px-4 py-2 border">{user.email}</td>
                    <td className="px-4 py-2 border">
                      <span className={`px-2 py-1 rounded text-xs ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'employee' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-2 border text-sm">
                      {new Date(user.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestAdminPanel;
