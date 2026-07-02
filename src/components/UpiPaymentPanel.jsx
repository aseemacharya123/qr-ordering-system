import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

import { buildUpiIntentUri, isAndroidDevice } from '../utils/upi.js';
import { formatCurrency } from '../utils/currency.js';
import { confirmUpiPaymentSent } from '../services/orderService.js';

function UpiPaymentPanel({ apiUrl, orderId, customerPhone, totalAmount, businessName, upiId, upiPayeeName, onDone }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [confirmState, setConfirmState] = useState('idle'); // idle | confirming | confirmed | error

  const upiUri = buildUpiIntentUri({
    vpa: upiId,
    payeeName: upiPayeeName || businessName,
    amount: totalAmount,
    note: `Order ${orderId}`,
    orderId,
  });

  useEffect(() => {
    let cancelled = false;

    if (upiUri) {
      QRCode.toDataURL(upiUri, { width: 240, margin: 1 })
        .then((dataUrl) => {
          if (!cancelled) {
            setQrDataUrl(dataUrl);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setQrDataUrl('');
          }
        });
    }

    return () => {
      cancelled = true;
    };
  }, [upiUri]);

  const handleConfirmPaid = async () => {
    setConfirmState('confirming');
    try {
      const response = await confirmUpiPaymentSent(apiUrl, { orderId, customerPhone });
      setConfirmState(response.success ? 'confirmed' : 'error');
    } catch (error) {
      setConfirmState('error');
    }
  };

  if (!upiUri) {
    return null;
  }

  return (
    <div className="card state-box" style={{ padding: '24px 20px' }}>
      <h2 className="state-title" style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Pay via UPI</h2>
      <p className="state-message" style={{ marginBottom: '16px' }}>
        {formatCurrency(totalAmount)} to {upiPayeeName || businessName}
      </p>

      {qrDataUrl && (
        <img
          src={qrDataUrl}
          alt="UPI payment QR code"
          style={{ width: '200px', height: '200px', margin: '0 auto 16px', display: 'block', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}
        />
      )}

      <p className="small-tag" style={{ marginBottom: '16px' }}>
        Scan with any UPI app, or tap below if you're on this phone. This pays the same UPI ID as the counter — no need to find the physical QR code.
      </p>

      {isAndroidDevice() && (
        <a
          href={upiUri}
          className="button button-primary button-block"
          style={{ marginBottom: '12px', textDecoration: 'none', display: 'block', textAlign: 'center' }}
        >
          Pay via UPI App
        </a>
      )}

      {confirmState === 'confirmed' ? (
        <div className="card" style={{ background: 'var(--color-primary-soft)', border: 'none', marginBottom: 0 }}>
          <p className="small-tag">Thanks! We've flagged this order as paid via UPI — staff will confirm it shortly.</p>
        </div>
      ) : (
        <button
          type="button"
          className="button button-secondary button-block"
          onClick={handleConfirmPaid}
          disabled={confirmState === 'confirming'}
        >
          {confirmState === 'confirming' ? 'Confirming...' : "I've completed the payment"}
        </button>
      )}

      {confirmState === 'error' && <div className="error-text">Could not confirm right now — the staff can still verify from their side.</div>}

      <button type="button" className="button button-secondary button-block" style={{ marginTop: '12px' }} onClick={onDone}>
        Continue
      </button>
    </div>
  );
}

export default UpiPaymentPanel;
