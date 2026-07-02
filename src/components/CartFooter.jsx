import React from 'react';
import { formatCurrency } from '../utils/currency.js';

function CartFooter({ itemCount, totalAmount, onOpenCart }) {
  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="sticky-footer">
      <div className="footer-summary">
        <div className="footer-bag">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className="footer-bag-badge">{itemCount}</span>
        </div>
        <div className="footer-total">{formatCurrency(totalAmount)}</div>
      </div>
      <button type="button" className="button button-primary" onClick={onOpenCart}>
        View Cart
      </button>
    </div>
  );
}

export default CartFooter;
