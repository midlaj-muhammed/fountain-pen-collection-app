import { colors } from './colors';

describe('colors token', () => {
  describe('brand', () => {
    it('exposes the violet accent from Figma', () => {
      // Figma-confirmed: "Pens" tab active, FAB, ADD NEW are all violet
      expect(colors.accent).toBe('#6B4FE0');
    });

    it('exposes a lighter accent tint for selected states', () => {
      // Figma-confirmed: selected day cells use a light violet background
      expect(colors.accentSoft).toBe('#EDE9FB');
    });

    it('exposes a deeper accent for pressed states', () => {
      expect(colors.accentDeep).toBe('#3B2A8C');
    });

    it('keeps primary text as ink black', () => {
      expect(colors.primary).toBe('#1A1A1A');
    });
  });

  describe('surfaces', () => {
    it('exposes paper-cream background', () => {
      // Figma: page background is a warm off-white
      expect(colors.bg).toBe('#FAF8F4');
    });

    it('exposes pure white for elevated cards', () => {
      expect(colors.bgElevated).toBe('#FFFFFF');
    });
  });

  describe('text', () => {
    it('exposes inverse text for use on violet backgrounds', () => {
      expect(colors.textInverse).toBe('#FFFFFF');
    });

    it('exposes muted text for captions', () => {
      expect(colors.textMuted).toBe('#6B6B6B');
    });
  });

  describe('ink dot indicator', () => {
    // Figma: 5-dot level indicator uses violet
    it('exposes filled-ink-dot color', () => {
      expect(colors.inkDot).toBe('#6B4FE0');
    });

    it('exposes empty-ink-dot color', () => {
      expect(colors.inkDotEmpty).toBe('#D8D2C2');
    });
  });

  describe('dark mode', () => {
    it('exposes dark accent different from light accent', () => {
      // Dark mode uses a slightly lighter violet for contrast on dark bg
      expect(colors.darkAccent).toBe('#8A73E8');
      expect(colors.darkAccent).not.toBe(colors.accent);
    });

    it('exposes dark surface colors', () => {
      expect(colors.darkBg).toBe('#0F0F10');
      expect(colors.darkSurface).toBe('#1A1A1C');
    });
  });

  describe('structural', () => {
    it('exposes every key as a valid color string (hex or rgba)', () => {
      for (const value of Object.values(colors)) {
        expect(typeof value).toBe('string');
        // Accept either #RRGGBB hex or rgba()/rgb() function notation
        expect(value).toMatch(/^(#[0-9A-F]{6}|rgba?\([^)]+\))$/i);
      }
    });
  });
});
