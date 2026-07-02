import React, { useState } from 'react';

function CheckoutForm({ fields, onChange, onSubmit, errors, disabled }) {
  const [showMoreDetails, setShowMoreDetails] = useState(false);

  return (
    <form onSubmit={onSubmit} style={{ display: 'grid', gap: '16px' }}>
      <div>
        <label htmlFor="customerName" style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem' }}>Name</label>
        <input
          id="customerName"
          name="customerName"
          className="input-field"
          value={fields.customerName}
          onChange={(e) => onChange('customerName', e.target.value)}
          placeholder="Enter your name"
        />
        {errors.customerName && <div className="error-text">{errors.customerName}</div>}
      </div>

      <div>
        <label htmlFor="customerPhone" style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem' }}>Phone</label>
        <input
          id="customerPhone"
          name="customerPhone"
          className="input-field"
          value={fields.customerPhone}
          onChange={(e) => onChange('customerPhone', e.target.value)}
          placeholder="Enter 10-digit mobile number"
        />
        {errors.customerPhone && <div className="error-text">{errors.customerPhone}</div>}
      </div>

      <div>
        <button
          type="button"
          onClick={() => setShowMoreDetails((prev) => !prev)}
          style={{
            border: 'none',
            background: 'none',
            padding: 0,
            color: 'var(--color-primary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
          }}
        >
          {showMoreDetails ? 'Hide extra details' : 'Tell us more (optional)'}
        </button>

        {showMoreDetails && (
          <div style={{ display: 'grid', gap: '14px', marginTop: '14px' }}>
            <div>
              <label htmlFor="age" style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem' }}>Age</label>
              <input
                id="age"
                name="age"
                type="number"
                min="1"
                max="120"
                className="input-field"
                value={fields.age}
                onChange={(e) => onChange('age', e.target.value)}
                placeholder="Optional"
              />
            </div>

            <div>
              <label htmlFor="gender" style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem' }}>Gender</label>
              <select
                id="gender"
                name="gender"
                className="input-field"
                value={fields.gender}
                onChange={(e) => onChange('gender', e.target.value)}
              >
                <option value="">Prefer not to say</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label htmlFor="society" style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem' }}>Society / Sector</label>
              <input
                id="society"
                name="society"
                className="input-field"
                value={fields.society}
                onChange={(e) => onChange('society', e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
        )}
      </div>

      {errors.cart && <div className="error-text">{errors.cart}</div>}

      <button type="submit" className="button button-primary button-block" disabled={disabled}>
        {disabled ? 'Placing order...' : 'Place Order'}
      </button>
    </form>
  );
}

export default CheckoutForm;
