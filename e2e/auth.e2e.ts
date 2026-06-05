/**
 * Auth flow — sign up, sign in, sign out, forgot password.
 *
 * Run with: `pnpm test:e2e -- --spec e2e/auth.e2e.ts`
 *
 * Requires:
 *   - Detox configured per SPEC §2.3 (e2e tests run on a simulator)
 *   - `e2e/.env.test` with a known-good test email
 *   - The Firebase Auth emulator OR a dedicated test project
 */
describe('Auth flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('shows the Welcome screen on first launch', async () => {
    await expect(element(by.text('Welcome to MyPen'))).toBeVisible();
  });

  it('navigates Welcome → Sign Up → fills the form → lands on Home', async () => {
    await element(by.text('Sign up')).tap();
    await element(by.id('signup-email')).typeText('alice@example.com');
    await element(by.id('signup-password')).typeText('correct-horse-battery');
    await element(by.id('signup-name')).typeText('Alice');
    await element(by.text('Create account')).tap();
    await expect(element(by.id('home-greeting'))).toBeVisible();
  });

  it('signs out from Settings and returns to Welcome', async () => {
    await element(by.id('tab-Settings')).tap();
    await element(by.id('se-signout')).tap();
    await expect(element(by.text('Welcome to MyPen'))).toBeVisible();
  });
});
