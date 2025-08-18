import React from 'react';

const SimpleTest = () => {
  console.log('SimpleTest component is rendering!');
  
  return (
    <div style={{ 
      padding: '20px', 
      backgroundColor: 'lightblue', 
      color: 'black',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      <h1>🎉 React is Working!</h1>
      <p>If you can see this, React is rendering correctly.</p>
      <p>Current time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default SimpleTest;
