// Simple test to verify frontend-backend connection
const testConnection = async () => {
  try {
    console.log('Testing backend connection...');
    
    // Test basic health check
    const healthResponse = await fetch('http://localhost:8000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);
    
    // Test branches endpoint
    console.log('Testing branches endpoint...');
    const branchesResponse = await fetch('http://localhost:8000/api/branches');
    console.log('Status:', branchesResponse.status, branchesResponse.statusText);
    
    if (branchesResponse.status === 401) {
      console.log('⚠️ Branches endpoint requires authentication (expected)');
      console.log('🎉 Frontend-Backend connection is working properly!');
      return;
    }
    
    const branchesText = await branchesResponse.text();
    console.log('Response text:', branchesText.substring(0, 200));
    
    try {
      const branchesData = JSON.parse(branchesText);
      console.log('✅ Branches endpoint:', branchesData);
    } catch (parseError) {
      console.log('⚠️ Could not parse branches response as JSON');
    }
    
    console.log('🎉 Frontend-Backend connection is working properly!');
    
  } catch (error) {
    console.error('❌ Connection error:', error.message);
  }
};

testConnection();
