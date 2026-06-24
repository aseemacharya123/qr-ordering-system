export function addItemToCart(cartItems, item) {
  const existing = cartItems.find((cartItem) => cartItem.itemId === item.itemId);

  if (existing) {
    return cartItems.map((cartItem) =>
      cartItem.itemId === item.itemId
        ? { ...cartItem, quantity: cartItem.quantity + 1 }
        : cartItem
    );
  }

  return [...cartItems, { ...item, quantity: 1 }];
}

export function updateCartQuantity(cartItems, itemId, delta) {
  return cartItems
    .map((cartItem) => {
      if (cartItem.itemId !== itemId) return cartItem;
      return { ...cartItem, quantity: Math.max(cartItem.quantity + delta, 0) };
    })
    .filter((cartItem) => cartItem.quantity > 0);
}

export function removeCartItem(cartItems, itemId) {
  return cartItems.filter((cartItem) => cartItem.itemId !== itemId);
}

export function calculateCartTotal(cartItems) {
  return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function getCartItemCount(cartItems) {
  return cartItems.reduce((count, item) => count + item.quantity, 0);
}
