export function formatCurrencyPEN(value) {
  const num = Number(value);
  if (!isFinite(num)) return 'S/ 0.00';
  try {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  } catch (e) {
    return `S/ ${num.toFixed(2)}`;
  }
}