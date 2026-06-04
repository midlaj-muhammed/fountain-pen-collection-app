import { radius } from './radius';

describe('radius token', () => {
  it('exposes sm, md, lg, pill', () => {
    expect(radius).toEqual({
      sm: 6,
      md: 10,
      lg: 16,
      pill: 999,
    });
  });

  it('pill is the largest (rounds to a circle)', () => {
    const values = Object.values(radius);
    expect(Math.max(...values)).toBe(radius.pill);
  });

  it('sm < md < lg < pill', () => {
    expect(radius.sm).toBeLessThan(radius.md);
    expect(radius.md).toBeLessThan(radius.lg);
    expect(radius.lg).toBeLessThan(radius.pill);
  });
});
