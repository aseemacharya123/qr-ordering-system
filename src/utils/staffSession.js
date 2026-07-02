function sessionKey(businessId) {
  return `staff_token_${businessId}`;
}

export function saveToken(businessId, token) {
  sessionStorage.setItem(sessionKey(businessId), token);
}

export function getToken(businessId) {
  return sessionStorage.getItem(sessionKey(businessId)) || '';
}

export function clearToken(businessId) {
  sessionStorage.removeItem(sessionKey(businessId));
}
