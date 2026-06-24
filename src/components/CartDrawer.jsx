import React from 'react';
import { formatCurrency } from '../utils/currency.js';

function CartDrawer({ visible, cartItems, totalAmount, onClose, onQuantityChange, onRemoveItem, onOpenCheckout }) {
  if (!visible) return null;

  return (
    <div className="cart-drawer">
      <div className="cart-drawer-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0 }}>Your Cart</h2>
            <p className="small-tag">{cartItems.length} item{cartItems.length > 1 ? 's' : ''}</p>
          </div>
          <button type="button" className="button button-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <div style={{ padding: '16px', flex: '1 1 auto', overflowY: 'auto' }}>
        {cartItems.length === 0 ? (
          <div className="empty-box">Your cart is empty.</div>
        ) : (
          cartItems.map((item) => (
            <div className="cart-item" key={item.itemId}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{item.itemName}</div>
                <div className="small-tag">{formatCurrency(item.price)} each</div>
                <div className="small-tag">Subtotal: {formatCurrency(item.price * item.quantity)}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                <div className="qty-controls">
                  <button type="button" onClick={() => onQuantityChange(item.itemId, -1)} className="button button-secondary" style={{ padding: '6px 10px' }}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button type="button" onClick={() => onQuantityChange(item.itemId, 1)} className="button button-secondary" style={{ padding: '6px 10px' }}>
                    +
                  </button>
                </div>
                <button type="button" className="button button-secondary" onClick={() => onRemoveItem(item.itemId)}>
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="cart-drawer-footer" style={{ marginTop: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div className="small-tag">Total</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{formatCurrency(totalAmount)}</div>
          </div>
          <button type="button" className="button button-primary" onClick={onOpenCheckout} disabled={cartItems.length === 0}>
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartDrawer;
