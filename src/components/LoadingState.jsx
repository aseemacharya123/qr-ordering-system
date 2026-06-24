import React from 'react';

function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="loading-box card" style={{ marginTop: '24px' }}>
      <p>{message}</p>
    </div>
  );
}

export default LoadingState;
