/**
 * Utilidades para el formulario de tarjeta del checkout.
 * NUNCA se persiste el número completo: solo marca, titular y últimos 4 dígitos
 * (ver CardInfo en transactionSlice; la transacción se guarda cifrada).
 */

/** Solo dígitos, máximo 16, agrupados de a 4: "4111111111111111" -> "4111 1111 1111 1111". */
export const formatCardNumber = (raw: string): string =>
  raw
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();

/** "1226" -> "12 / 26". */
export const formatExpiry = (raw: string): string => {
  const d = raw.replace(/\D/g, '').slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)} / ${d.slice(2)}`;
};

/** Máximo 3 dígitos. */
export const formatCvv = (raw: string): string => raw.replace(/\D/g, '').slice(0, 3);

/** Detecta la marca por el primer dígito (simplificado). */
export const detectBrand = (raw: string): string => {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('4')) return 'Visa';
  if (d.startsWith('5')) return 'Mastercard';
  if (d.startsWith('3')) return 'Amex';
  return 'Tarjeta';
};

/** Últimos 4 dígitos (o '' si no hay suficientes). */
export const last4 = (raw: string): string => {
  const d = raw.replace(/\D/g, '');
  return d.length >= 4 ? d.slice(-4) : '';
};

/** Valida que los campos estén completos para habilitar el pago. */
export const isCardComplete = (
  number: string,
  holder: string,
  expiry: string,
  cvv: string,
): boolean => {
  const digits = number.replace(/\D/g, '');
  const exp = expiry.replace(/\D/g, '');
  return (
    digits.length >= 15 &&
    holder.trim().length >= 3 &&
    exp.length === 4 &&
    cvv.replace(/\D/g, '').length === 3
  );
};
