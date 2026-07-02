// Builds a standard UPI deep-link ("UPI intent") URI. Any UPI app (GPay, PhonePe, Paytm,
// BHIM, etc.) can open this to prefill a payment. Critically, the `pa` (payee address) is
// the business's own UPI ID — the same one already linked to their physical soundbox device
// at the counter. Paying through this link credits the exact same merchant account a normal
// QR-code scan would, so the soundbox still announces the payment; the app isn't reading or
// controlling the soundbox itself, it's just using the same receiving UPI ID.
export function buildUpiIntentUri({ vpa, payeeName, amount, note, orderId }) {
  if (!vpa) {
    return '';
  }

  const params = new URLSearchParams({
    pa: vpa,
    pn: payeeName || 'Merchant',
    am: String(amount),
    cu: 'INR',
  });

  if (note) {
    params.set('tn', note);
  }
  if (orderId) {
    params.set('tr', orderId);
  }

  return `upi://pay?${params.toString()}`;
}

// UPI intent links only reliably auto-open a UPI app on Android; iOS Safari support is
// inconsistent across UPI apps. Callers should always show the QR fallback too, but can use
// this to decide whether the "Pay via UPI app" button is worth surfacing at all.
export function isAndroidDevice() {
  return typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent || '');
}
