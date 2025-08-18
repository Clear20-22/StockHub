import React from 'react';

const TailwindTest = () => {
  return (
    <div style={{minHeight: '100vh', backgroundColor: 'red', padding: '20px'}}>
      <h1 style={{color: 'white', fontSize: '32px', marginBottom: '20px'}}>
        Inline Styles Test (Should show red background)
      </h1>
      
      <div className="bg-blue-500 p-8 text-white text-2xl">
        Tailwind Test - This should be blue with white text if Tailwind works
      </div>
      
      <div className="mt-4 p-4 bg-green-500 text-white rounded-lg shadow-lg">
        Another Tailwind test - Green background, white text, rounded corners
      </div>
      
      <div style={{marginTop: '20px', padding: '16px', backgroundColor: 'yellow', color: 'black'}}>
        Inline styles (yellow) - This should always work
      </div>
    </div>
  );
};

export default TailwindTest;
