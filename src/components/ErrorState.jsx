import React from 'react';

function ErrorState({ message }) {
  return (
    <div className="card state-box" style={{ marginTop: '16px' }}>
      <div className="state-icon state-icon-danger">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="state-message" style={{ color: 'var(--color-danger)', fontWeight: 600 }}>{message}</p>
    </div>
  );
}

export default ErrorState;
