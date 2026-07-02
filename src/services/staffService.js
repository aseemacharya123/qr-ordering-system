async function postToBackend(apiUrl, payload) {
  const response = await fetch(apiUrl, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  if (!text) {
    throw new Error('Empty response from server');
  }

  return JSON.parse(text);
}

export async function verifyStaffPin(apiUrl, pin) {
  return postToBackend(apiUrl, { action: 'verifyStaffPin', pin });
}

export async function fetchKitchenOrders(apiUrl, token) {
  return postToBackend(apiUrl, { action: 'kitchenOrders', token });
}

export async function updateOrderStatus(apiUrl, token, orderId, status) {
  return postToBackend(apiUrl, { action: 'updateOrderStatus', token, orderId, status });
}

export async function markOrderPaid(apiUrl, token, orderId) {
  return postToBackend(apiUrl, { action: 'markOrderPaid', token, orderId });
}
