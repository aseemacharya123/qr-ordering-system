export function formatOrderPayload(business, tableNo, customerName, customerPhone, cartItems) {
  const items = cartItems.map((item) => ({
    itemId: item.itemId,
    name: item.itemName,
    price: item.price,
    quantity: item.quantity,
    subtotal: item.price * item.quantity,
  }));

  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  return {
    businessId: business.businessId,
    businessName: business.businessName,
    tableNo: tableNo || '',
    customerName,
    customerPhone,
    items,
    totalAmount,
    source: 'web',
  };
}
