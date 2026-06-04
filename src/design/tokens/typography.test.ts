import { type, type TypeStyle } from './typography';

describe('type token', () => {
  describe('font families', () => {
    it('exposes a non-empty sans family', () => {
      expect(typeof type.fontSans).toBe('string');
      expect(type.fontSans.length).toBeGreaterThan(0);
    });

    it('exposes a serif family for big titles', () => {
      expect(['Georgia', 'serif']).toContain(type.fontSerif);
    });
  });

  describe('type scale', () => {
    const required = [
      'display',
      'h1',
      'h2',
      'h3',
      'body',
      'bodyBold',
      'small',
      'caption',
      'numeric',
    ] as const;

    it.each(required)('%s exists and has size/lineHeight/weight', (key) => {
      const style = (type as unknown as Record<string, TypeStyle>)[key];
      expect(style).toBeDefined();
      expect(typeof style?.size).toBe('number');
      expect(typeof style?.lineHeight).toBe('number');
      expect(typeof style?.weight).toBe('string');
    });

    it('uses sizes that are even or close to 4-pt grid', () => {
      // Each size should be on the 4-pt grid (or one off, e.g. 11, 13, 17)
      const sizes = required.map((k) => (type as unknown as Record<string, TypeStyle>)[k]?.size);
      for (const s of sizes) {
        expect(s).toBeDefined();
        expect([2, 4, 8, 11, 12, 13, 16, 17, 20, 24, 28, 32, 36, 40]).toContain(s);
      }
    });

    it('uses lineHeight >= size for legibility', () => {
      const styles = required.map((k) => (type as unknown as Record<string, TypeStyle>)[k]);
      for (const s of styles) {
        expect(s?.lineHeight).toBeGreaterThanOrEqual(s?.size ?? 0);
      }
    });
  });

  describe('button variant', () => {
    it('has uppercase letter-spacing for primary actions (ADD NEW, ADD EVENT)', () => {
      expect(type.button.letterSpacing).toBeGreaterThan(0);
      expect(typeof type.button.weight).toBe('string');
    });
  });
});
