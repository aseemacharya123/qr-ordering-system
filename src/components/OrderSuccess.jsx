import React from 'react';

function OrderSuccess({ orderId, onBackToMenu }) {
  return (
    <div className="container">
      <div className="card state-box" style={{ marginTop: '40px', padding: '32px 20px' }}>
        <div className="state-icon state-icon-success">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h2 className="state-title" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Order placed successfully!</h2>
        <p className="state-message" style={{ marginBottom: '4px' }}>
          Your order ID is <strong style={{ color: 'var(--color-text)' }}>{orderId}</strong>
        </p>
        <p className="state-message" style={{ marginBottom: '20px' }}>
          Thank you for ordering. The shop will receive your order shortly on WhatsApp.
        </p>
        <button type="button" className="button button-primary" onClick={onBackToMenu}>
          Back to menu
        </button>
      </div>
    </div>
  );
}

export default OrderSuccess;
