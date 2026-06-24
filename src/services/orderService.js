export async function submitOrder(apiUrl, payload) {

  console.log('API URL:', apiUrl);
  console.log('PAYLOAD:', payload);

  const response = await fetch(apiUrl, {
    method: 'POST',
    mode: 'cors',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();

  console.log('RAW RESPONSE:', text);

  if (!text) {
    throw new Error('Empty response from server');
  }

  const data = JSON.parse(text);

  return data;
}
