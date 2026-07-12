import { isUnavailable, soldOutLabel, isOutOfStockError } from '../src/utils/stock';
import type { Product } from '../src/data/products';

const make = (stock: number): Product => ({
  id: 'p1',
  name: 'Pieza',
  priceCop: 1000,
  category: 'tea',
  image: 'x',
  rating: 5,
  stock,
});

describe('stock utils', () => {
  it('isUnavailable: sin producto o sin stock suficiente', () => {
    expect(isUnavailable(null, 1)).toBe(true);
    expect(isUnavailable(undefined, 1)).toBe(true);
    expect(isUnavailable(make(0), 1)).toBe(true);
    expect(isUnavailable(make(2), 3)).toBe(true);
    expect(isUnavailable(make(3), 3)).toBe(false);
    expect(isUnavailable(make(5), 1)).toBe(false);
  });

  it('soldOutLabel: "Agotado" en 0, "Solo N disponibles" si queda algo', () => {
    expect(soldOutLabel(make(0))).toBe('Agotado');
    expect(soldOutLabel(null)).toBe('Agotado');
    expect(soldOutLabel(make(2))).toBe('Solo 2 disponibles');
  });

  it('isOutOfStockError: detecta el 422 de stock del backend', () => {
    expect(
      isOutOfStockError({
        status: 422,
        data: { message: 'Sin stock suficiente para tea-set (disponible: 0)' },
      }),
    ).toBe(true);
    expect(
      isOutOfStockError({ status: 422, data: { message: 'Producto no encontrado: x' } }),
    ).toBe(true);
    expect(isOutOfStockError({ status: 500, data: { message: 'boom' } })).toBe(false);
    expect(isOutOfStockError({ status: 400, data: { message: 'stock' } })).toBe(false);
    expect(isOutOfStockError(new Error('net'))).toBe(false);
  });
});
