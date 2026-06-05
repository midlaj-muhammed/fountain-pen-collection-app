/**
 * Lightweight retry helper with exponential backoff. Use for client
 * mutations that can fail for transient reasons (network blip,
 * offline-then-online). Cap at maxAttempts; pass `shouldRetry` to
 * filter specific errors.
 */
export type RetryOptions = {
  maxAttempts?: number;
  baseMs?: number;
  shouldRetry?: (err: unknown) => boolean;
};

const DEFAULTS = {
  maxAttempts: 3,
  baseMs: 200,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? DEFAULTS.maxAttempts;
  const baseMs = options.baseMs ?? DEFAULTS.baseMs;
  const shouldRetry = options.shouldRetry;

  let lastError: unknown;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (shouldRetry && !shouldRetry(err)) throw err;
      if (attempt === maxAttempts - 1) break;
      // Exponential backoff: 200ms, 400ms, 800ms ...
      const delay = baseMs * 2 ** attempt;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}
