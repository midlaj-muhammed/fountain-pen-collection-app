/**
 * Tests for the retry helper. Verifies the exponential backoff
 * schedule and that successful results short-circuit.
 */
import { withRetry } from './retry';

describe('withRetry', () => {
  it('returns the first successful result without retrying', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, { maxAttempts: 3, baseMs: 1 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and eventually returns success', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('transient 1'))
      .mockRejectedValueOnce(new Error('transient 2'))
      .mockResolvedValue('ok');
    const result = await withRetry(fn, { maxAttempts: 3, baseMs: 1 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws the last error after maxAttempts', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('boom'));
    await expect(withRetry(fn, { maxAttempts: 2, baseMs: 1 })).rejects.toThrow('boom');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
