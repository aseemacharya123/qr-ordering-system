import React, { useState } from 'react';
import { verifyStaffPin } from '../services/staffService.js';

function StaffLogin({ apiUrl, onLoginSuccess, onBack }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!pin.trim()) {
      setError('Enter the staff PIN.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await verifyStaffPin(apiUrl, pin.trim());

      if (response.success) {
        onLoginSuccess(response.token);
      } else {
        setError(response.error || 'Incorrect PIN.');
      }
    } catch (submitError) {
      setError('Could not verify PIN. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '48px' }}>
      <div className="card">
        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '16px' }}>Staff / Kitchen Login</h2>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label htmlFor="staffPin" style={{ display: 'block', marginBottom: '8px', fontWeight: 700, fontSize: '0.9rem' }}>
              Enter PIN
            </label>
            <input
              id="staffPin"
              name="staffPin"
              type="password"
              inputMode="numeric"
              className="input-field"
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="Enter the staff PIN"
              autoFocus
            />
            {error && <div className="error-text">{error}</div>}
          </div>

          <button type="submit" className="button button-primary button-block" disabled={isSubmitting}>
            {isSubmitting ? 'Checking...' : 'Login'}
          </button>

          <button type="button" className="button button-secondary button-block" onClick={onBack}>
            Back
          </button>
        </form>
      </div>
    </div>
  );
}

export default StaffLogin;
