import React from 'react';

function CheckoutForm({ customerName, customerPhone, onChange, onSubmit, errors, disabled }) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: '16px' }}>
      <div>
        <label htmlFor="customerName" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Name</label>
        <input
          id="customerName"
          name="customerName"
          className="input-field"
          value={customerName}
          onChange={(e) => onChange('customerName', e.target.value)}
          placeholder="Enter your name"
        />
        {errors.customerName && <div className="error-text">{errors.customerName}</div>}
      </div>

      <div>
        <label htmlFor="customerPhone" style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Phone</label>
        <input
          id="customerPhone"
          name="customerPhone"
          className="input-field"
          value={customerPhone}
          onChange={(e) => onChange('customerPhone', e.target.value)}
          placeholder="Enter 10-digit mobile number"
        />
        {errors.customerPhone && <div className="error-text">{errors.customerPhone}</div>}
      </div>

      {errors.cart && <div className="error-text">{errors.cart}</div>}

      <button type="submit" className="button button-primary" disabled={disabled}>
        Place Order
      </button>
    </form>
  );
}

export default CheckoutForm;
