export function formatCurrency(value, currencySymbol = '₹') {
  return `${currencySymbol}${value.toFixed(0)}`;
}
