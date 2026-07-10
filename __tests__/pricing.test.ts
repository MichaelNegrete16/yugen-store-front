import {
  computeOrderSummary,
  SHIPPING_COP,
  DISCOUNT_CODE,
} from '../src/utils/pricing';

describe('computeOrderSummary', () => {
  it('devuelve todo en cero cuando el subtotal es 0', () => {
    expect(computeOrderSummary(0)).toEqual({
      subtotal: 0,
      shipping: 0,
      tax: 0,
      discount: 0,
      total: 0,
    });
  });

  it('suma envío e IVA (19%) sin descuento', () => {
    const s = computeOrderSummary(885000);
    expect(s.subtotal).toBe(885000);
    expect(s.shipping).toBe(SHIPPING_COP);
    expect(s.tax).toBe(168150); // 885.000 * 0.19
    expect(s.discount).toBe(0);
    expect(s.total).toBe(885000 + 15000 + 168150);
  });

  it('aplica el descuento con el código válido', () => {
    const s = computeOrderSummary(885000, DISCOUNT_CODE);
    expect(s.discount).toBe(88500); // 10%
    expect(s.total).toBe(885000 + 15000 + 168150 - 88500);
  });

  it('ignora un código de descuento inválido', () => {
    expect(computeOrderSummary(885000, 'NOPE').discount).toBe(0);
  });
});
