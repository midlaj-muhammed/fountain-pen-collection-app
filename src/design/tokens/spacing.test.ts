import { space } from './spacing';

describe('space token', () => {
  it('exposes a 4-pt scale', () => {
    expect(space).toEqual({
      xxs: 2,
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 32,
      xxxl: 48,
    });
  });

  it('every step is a multiple of 2 (so it stays on the 4-pt grid for even values)', () => {
    for (const v of Object.values(space)) {
      expect(v % 2).toBe(0);
    }
  });

  it('every step is strictly larger than the previous', () => {
    const values = Object.values(space);
    for (let i = 1; i < values.length; i++) {
      // @ts-expect-error -- arithmetic on a literal-typed array
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });
});
