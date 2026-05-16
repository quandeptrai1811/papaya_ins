export function formatCurrency(amount, currencyCode) {
  if (amount === undefined || amount === null) return "N/A";
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

export function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

export function formatNumber(num) {
  if (num === undefined || num === null) return "0";
  return new Intl.NumberFormat('en-US').format(num);
}
