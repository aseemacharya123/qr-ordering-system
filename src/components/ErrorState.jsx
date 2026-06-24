import React from 'react';

function ErrorState({ message }) {
  return (
    <div className="error-box card" style={{ marginTop: '24px' }}>
      <p className="error-text">{message}</p>
    </div>
  );
}

export default ErrorState;
