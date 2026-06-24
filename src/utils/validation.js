export function validateIndianPhone(phone) {
  const normalized = phone.replace(/\D/g, '');

  if (normalized.length === 10) {
    return /^[6-9]\d{9}$/.test(normalized);
  }

  if (normalized.length === 12 && normalized.startsWith('91')) {
    return /^[6-9]\d{9}$/.test(normalized.slice(2));
  }

  return false;
}

export function validateCheckoutForm({ customerName, customerPhone, cartItems }) {
  const errors = {};

  if (!customerName || customerName.trim().length === 0) {
    errors.customerName = 'Name is required.';
  }

  if (!customerPhone || customerPhone.trim().length === 0) {
    errors.customerPhone = 'Phone number is required.';
  } else if (!validateIndianPhone(customerPhone)) {
    errors.customerPhone = 'Enter a valid 10-digit Indian mobile number.';
  }

  if (!cartItems || cartItems.length === 0) {
    errors.cart = 'Add at least one item to the cart.';
  }

  return errors;
}
