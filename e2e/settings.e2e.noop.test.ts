// Regression: e2e/settings.e2e.ts once contained
//   expect(screen.getByTestId ? null : null).toBeTruthy()
// which always evaluated to expect(false).toBeTruthy() and silently
// passed. The Detox suite is the regression guard for the Settings flow.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('e2e/settings.e2e.ts', () => {
  it('does not contain the always-pass no-op assertion', () => {
    const src = readFileSync(join(__dirname, 'settings.e2e.ts'), 'utf8');
    expect(src).not.toMatch(/screen\.getByTestId\s*\?\s*null\s*:\s*null/);
  });
});
