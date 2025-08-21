// Test just the health endpoint to confirm basic connectivity
const testBasicConnection = async () => {
  try {
    console.log('Testing basic backend connection...');
    
    // Test basic endpoints on port 8001
    const endpoints = [
      '/api/health',
      '/api/branches',
      '/api/auth/test'  // This doesn't exist, should give 404
    ];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://localhost:8001${endpoint}`);
        console.log(`${endpoint}: ${response.status} ${response.statusText}`);
      } catch (error) {
        console.log(`${endpoint}: Connection error - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('Overall test error:', error.message);
  }
};

testBasicConnection();
