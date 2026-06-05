/**
 * Regression test for the no-op Detox assertion bug.
 *
 * e2e/settings.e2e.ts used to contain
 *   expect(screen.getByTestId ? null : null).toBeTruthy()
 * which always evaluates to expect(false).toBeTruthy() and silently
 * passes — giving a false sense of test coverage. The Detox suite is
 * the regression guard for the user-facing Settings flow; an
 * always-pass assertion in there is a real risk.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('e2e/settings.e2e.ts', () => {
  it('does not contain the always-pass no-op assertion', () => {
    const src = readFileSync(join(__dirname, 'settings.e2e.ts'), 'utf8');
    // Strip whitespace before checking — the bug could be written
    // with any amount of space between the tokens.
    const compact = src.replace(/\s+/g, ' ');
    expect(compact).not.toMatch(/screen\.getByTestId\s*\?\s*null\s*:\s*null/);
    // Also: don't accept the broader anti-pattern.
    expect(src).not.toMatch(/screen\.getByTestId\s*\?\s*null\s*:\s*null/);
  });
});
