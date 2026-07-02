import React from 'react';

function NotFoundPage({ message = 'Page not found.' }) {
  return (
    <div className="container">
      <div className="card state-box" style={{ marginTop: '40px', padding: '32px 20px' }}>
        <div className="state-icon state-icon-muted">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
        <h1 className="state-title" style={{ fontSize: '1.15rem' }}>Oops!</h1>
        <p className="state-message">{message}</p>
      </div>
    </div>
  );
}

export default NotFoundPage;
