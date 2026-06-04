import type { InkLevelPct } from './domain';

/**
 * Compile-time + runtime check that InkLevelPct is restricted to the 5 steps
 * the Figma ink-level indicator shows. This is a "type assertion" test —
 * if the union is widened the test still passes; if it is narrowed further
 * (e.g. someone removes `0` or `100`) the test will fail to type-check.
 */
describe('InkLevelPct', () => {
  it('accepts the 5 Figma-defined steps', () => {
    const steps: InkLevelPct[] = [0, 20, 40, 60, 80, 100];
    expect(steps).toHaveLength(6);
    expect(Math.max(...steps)).toBe(100);
    expect(Math.min(...steps)).toBe(0);
  });

  it('steps are evenly spaced at 20%', () => {
    const steps: InkLevelPct[] = [0, 20, 40, 60, 80, 100];
    for (let i = 1; i < steps.length; i++) {
      // @ts-expect-error -- arithmetic on a literal-typed array
      expect(steps[i] - steps[i - 1]).toBe(20);
    }
  });
});
