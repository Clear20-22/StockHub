import React from 'react';

function SimpleApp() {
  return (
    <div style={{
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <header style={{
        backgroundColor: '#2563eb',
        color: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h1>🏭 StockHub - Working!</h1>
        <p>Warehouse Management System</p>
      </header>
      
      <main style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2>✅ React Application is Running</h2>
        <p>Current time: {new Date().toLocaleString()}</p>
        <p>If you can see this, the frontend is working correctly!</p>
        
        <div style={{ marginTop: '20px' }}>
          <button style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}>
            Test Button
          </button>
          
          <button style={{
            backgroundColor: '#f59e0b',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            Another Button
          </button>
        </div>
      </main>
    </div>
  );
}

export default SimpleApp;
