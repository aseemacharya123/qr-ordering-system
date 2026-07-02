import React from 'react';

function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="card state-box" style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div className="spinner" />
      <p className="state-message">{message}</p>
    </div>
  );
}

export default LoadingState;
