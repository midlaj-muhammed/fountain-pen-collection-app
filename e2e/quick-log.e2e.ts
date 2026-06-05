/**
 * Quick log — 1-tap path from Home.
 */
describe('Quick log', () => {
  beforeAll(async () => {
    // Assumes pens.e2e.ts and inks.e2e.ts have run first.
    await device.launchApp({ newInstance: false });
  });

  it('logs a session with one tap from Home', async () => {
    await element(by.id('tab-Pens')).tap();
    await expect(element(by.id('ql-log-button'))).toBeVisible();
    await element(by.id('ql-log-button')).tap();
    // The toast appears
    await expect(element(by.text(/Logged/))).toBeVisible();
    // Detail screen shows the new session
    await expect(element(by.id('sd'))).toBeVisible();
  });
});
