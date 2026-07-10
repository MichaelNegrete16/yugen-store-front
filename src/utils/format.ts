/**
 * Formatea un monto en pesos colombianos: 320000 -> "$320.000".
 * Agrupa miles con punto (formato es-CO) sin usar Intl (limitado en Hermes).
 */
export const formatCop = (amount: number): string => {
  const grouped = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${grouped}`;
};
