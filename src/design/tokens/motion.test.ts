import { motion } from './motion';

describe('motion token', () => {
  describe('durations', () => {
    it('exposes fast < base < slow', () => {
      expect(motion.duration.fast).toBeLessThan(motion.duration.base);
      expect(motion.duration.base).toBeLessThan(motion.duration.slow);
    });

    it('all durations are positive numbers', () => {
      for (const v of Object.values(motion.duration)) {
        expect(typeof v).toBe('number');
        expect(v).toBeGreaterThan(0);
      }
    });

    it('fast is ~120ms, base is ~220ms, slow is ~360ms (Material/iOS-aligned)', () => {
      expect(motion.duration.fast).toBe(120);
      expect(motion.duration.base).toBe(220);
      expect(motion.duration.slow).toBe(360);
    });
  });

  describe('easing', () => {
    it('exposes standard and emphasized curves', () => {
      expect(motion.ease.standard).toBe('cubic-bezier(0.2, 0, 0, 1)');
      expect(motion.ease.emphasized).toBe('cubic-bezier(0.3, 0, 0, 1)');
    });

    it('emphasized is more aggressive than standard (steeper initial slope)', () => {
      // Standard starts at 0.2, emphasized at 0.3 — emphasized feels snappier
      const stdStart = Number(motion.ease.standard.match(/cubic-bezier\(([\d.]+)/)?.[1]);
      const emphStart = Number(motion.ease.emphasized.match(/cubic-bezier\(([\d.]+)/)?.[1]);
      expect(emphStart).toBeGreaterThan(stdStart);
    });
  });
});
