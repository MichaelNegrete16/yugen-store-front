import { formatCop } from '../src/utils/format';

describe('formatCop', () => {
  it('agrupa miles con punto y antepone $', () => {
    expect(formatCop(320000)).toBe('$320.000');
    expect(formatCop(1500)).toBe('$1.500');
    expect(formatCop(1234567)).toBe('$1.234.567');
  });

  it('maneja montos pequeños y redondea', () => {
    expect(formatCop(0)).toBe('$0');
    expect(formatCop(999)).toBe('$999');
    expect(formatCop(1500.7)).toBe('$1.501');
  });
});
