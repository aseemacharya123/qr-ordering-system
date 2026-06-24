import React from 'react';

function OrderSuccess({ orderId, onBackToMenu }) {
  return (
    <div className="success-box card" style={{ marginTop: '24px' }}>
      <h2>Order placed successfully!</h2>
      <p>Your order ID is <strong>{orderId}</strong>.</p>
      <p>Thank you for ordering. The shop will receive the order shortly on WhatsApp.</p>
      <button type="button" className="button button-primary" onClick={onBackToMenu}>
        Back to menu
      </button>
    </div>
  );
}

export default OrderSuccess;
