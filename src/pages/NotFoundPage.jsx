import React from 'react';

function NotFoundPage({ message = 'Page not found.' }) {
  return (
    <div className="container">
      <div className="card" style={{ textAlign: 'center' }}>
        <h1>Oops!</h1>
        <p>{message}</p>
      </div>
    </div>
  );
}

export default NotFoundPage;
