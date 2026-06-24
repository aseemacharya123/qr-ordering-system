import React from 'react';
import { formatCurrency } from '../utils/currency.js';

function CartFooter({ itemCount, totalAmount, onOpenCart }) {
  if (itemCount === 0) {
    return null;
  }

  return (
    <div className="sticky-footer">
      <div>
        <div style={{ fontWeight: 700 }}>{itemCount} item{itemCount > 1 ? 's' : ''}</div>
        <div>{formatCurrency(totalAmount)}</div>
      </div>
      <button type="button" className="button button-primary" onClick={onOpenCart}>
        View Cart
      </button>
    </div>
  );
}

export default CartFooter;
