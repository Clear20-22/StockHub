import React from 'react';

const MinimalTest = () => {
  console.log('MinimalTest component rendered');
  
  return (
    <div style={{
      backgroundColor: 'red',
      color: 'white',
      padding: '50px',
      fontSize: '30px',
      fontWeight: 'bold',
      position: 'fixed',
      top: '0',
      left: '0',
      width: '100vw',
      height: '100vh',
      zIndex: '9999'
    }}>
      <h1>🔥 REACT IS WORKING! 🔥</h1>
      <p>If you see this red screen, React is rendering.</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default MinimalTest;
