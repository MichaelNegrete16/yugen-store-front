import {
  formatCardNumber,
  formatExpiry,
  formatCvv,
  detectBrand,
  last4,
  isCardComplete,
} from '../src/utils/card';

describe('utils/card', () => {
  it('formatea el número en grupos de 4 y limita a 16 dígitos', () => {
    expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
    expect(formatCardNumber('41111111111111119999')).toBe('4111 1111 1111 1111');
    expect(formatCardNumber('abc4111')).toBe('4111');
  });

  it('formatea la expiración MMYY', () => {
    expect(formatExpiry('12')).toBe('12');
    expect(formatExpiry('1226')).toBe('12 / 26');
    expect(formatExpiry('12/26')).toBe('12 / 26');
  });

  it('limita el CVV a 3 dígitos', () => {
    expect(formatCvv('12ab34')).toBe('123');
  });

  it('detecta la marca por el primer dígito', () => {
    expect(detectBrand('4111')).toBe('Visa');
    expect(detectBrand('5500')).toBe('Mastercard');
    expect(detectBrand('3400')).toBe('Amex');
    expect(detectBrand('9999')).toBe('Tarjeta');
  });

  it('extrae los últimos 4 dígitos', () => {
    expect(last4('4111 1111 1111 1234')).toBe('1234');
    expect(last4('12')).toBe('');
  });

  it('valida que la tarjeta esté completa', () => {
    expect(isCardComplete('4111 1111 1111 1111', 'Kenji Sato', '12 / 26', '123')).toBe(true);
    expect(isCardComplete('4111', 'Kenji Sato', '12 / 26', '123')).toBe(false);
    expect(isCardComplete('4111 1111 1111 1111', 'Ke', '12 / 26', '123')).toBe(false);
    expect(isCardComplete('4111 1111 1111 1111', 'Kenji Sato', '12', '123')).toBe(false);
    expect(isCardComplete('4111 1111 1111 1111', 'Kenji Sato', '12 / 26', '12')).toBe(false);
  });
});
