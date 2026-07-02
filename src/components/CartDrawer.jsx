import React from 'react';
import { formatCurrency } from '../utils/currency.js';

function CartDrawer({ visible, cartItems, totalAmount, onClose, onQuantityChange, onRemoveItem, onOpenCheckout }) {
  if (!visible) return null;

  return (
    <>
      <div className="cart-backdrop" onClick={onClose} />
      <div className="cart-drawer">
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Your Cart</h2>
              <p className="small-tag">{cartItems.length} item{cartItems.length > 1 ? 's' : ''}</p>
            </div>
            <button type="button" className="icon-button" onClick={onClose} aria-label="Close cart">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
        <div style={{ padding: '16px', flex: '1 1 auto', overflowY: 'auto' }}>
          {cartItems.length === 0 ? (
            <div className="state-box">
              <p className="state-message">Your cart is empty.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div className="cart-item" key={item.itemId}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: '4px' }}>{item.itemName}</div>
                  <div className="small-tag">{formatCurrency(item.price)} each</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem' }}>{formatCurrency(item.price * item.quantity)}</div>
                  <div className="qty-controls">
                    <button type="button" onClick={() => onQuantityChange(item.itemId, -1)} className="qty-btn">
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button type="button" onClick={() => onQuantityChange(item.itemId, 1)} className="qty-btn">
                      +
                    </button>
                  </div>
                  <button type="button" className="remove-link" onClick={() => onRemoveItem(item.itemId)}>
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="cart-drawer-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div className="small-tag">Total</div>
              <div style={{ fontWeight: 800, fontSize: '1.15rem' }}>{formatCurrency(totalAmount)}</div>
            </div>
          </div>
          <button type="button" className="button button-primary button-block" onClick={onOpenCheckout} disabled={cartItems.length === 0}>
            Checkout
          </button>
        </div>
      </div>
    </>
  );
}

export default CartDrawer;
