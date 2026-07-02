export function formatCurrency(value, currencySymbol = '₹') {
  const numericValue = Number(value) || 0;
  return `${currencySymbol}${numericValue.toFixed(0)}`;
}
