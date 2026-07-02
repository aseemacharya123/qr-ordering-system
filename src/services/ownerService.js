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

export async function verifyOwnerPin(apiUrl, pin) {
  return postToBackend(apiUrl, { action: 'verifyOwnerPin', pin });
}

export async function fetchDashboard(apiUrl, token) {
  return postToBackend(apiUrl, { action: 'dashboard', token });
}

export async function fetchAiInsights(apiUrl, token, forceRefresh = false) {
  return postToBackend(apiUrl, { action: 'aiInsights', token, forceRefresh });
}
