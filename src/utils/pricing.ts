/**
 * Cálculo del resumen del pedido (adaptado a Colombia / COP).
 *
 * Réplica del "Order Summary" del diseño: subtotal + envío + IVA − descuento.
 * Montos en pesos colombianos sin decimales.
 */

/** Envío estándar fijo. */
export const SHIPPING_COP = 15000;
/** IVA Colombia. */
export const IVA_RATE = 0.19;
/** Código de descuento de la tienda y su porcentaje sobre el subtotal. */
export const DISCOUNT_CODE = 'YUGEN10';
export const DISCOUNT_RATE = 0.1;

export interface OrderSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

/**
 * Calcula el resumen a partir del subtotal.
 * @param subtotal  Suma de (precio × cantidad) de los ítems.
 * @param discountCode  Código de descuento aplicado (opcional).
 */
export const computeOrderSummary = (
  subtotal: number,
  discountCode?: string,
): OrderSummary => {
  if (subtotal <= 0) {
    return { subtotal: 0, shipping: 0, tax: 0, discount: 0, total: 0 };
  }
  const shipping = SHIPPING_COP;
  const tax = Math.round(subtotal * IVA_RATE);
  const discount =
    discountCode === DISCOUNT_CODE ? Math.round(subtotal * DISCOUNT_RATE) : 0;
  const total = subtotal + shipping + tax - discount;
  return { subtotal, shipping, tax, discount, total };
};
