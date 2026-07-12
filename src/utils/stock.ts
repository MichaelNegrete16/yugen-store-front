import type { Product } from '../data/products';

/** No hay stock suficiente para la cantidad pedida (o el producto ya no existe). */
export const isUnavailable = (
  product: Product | null | undefined,
  qty: number,
): boolean => !product || product.stock < qty;

/** Etiqueta para un artículo sin stock suficiente. */
export const soldOutLabel = (product: Product | null | undefined): string =>
  product && product.stock > 0
    ? `Solo ${product.stock} disponibles`
    : 'Agotado';

/**
 * El backend responde 422 cuando un artículo no tiene stock o ya no existe.
 * Distinguirlo del error genérico para avisar que hay algo agotado.
 */
export const isOutOfStockError = (err: unknown): boolean => {
  const e = err as { status?: number; data?: { message?: string | string[] } };
  if (e?.status !== 422) return false;
  const msg = e.data?.message;
  const text = Array.isArray(msg) ? msg.join(' ') : String(msg ?? '');
  return /stock|agotad|no encontrado/i.test(text);
};
