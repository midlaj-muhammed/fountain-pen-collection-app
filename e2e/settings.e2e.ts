/**
 * Settings — toggle theme, toggle reminder, sign out.
 */
describe('Settings', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
  });

  it('toggles the daily reminder and opens the hour picker', async () => {
    await element(by.id('tab-Settings')).tap();
    await element(by.id('se-reminder')).tap();
    await element(by.id('se-hour')).tap();
    await expect(element(by.text('Reminder hour'))).toBeVisible();
    await element(by.text('20:00')).tap();
  });

  it('opens Delete account and shows the confirm field', async () => {
    await element(by.text('Delete account')).tap();
    // The Delete account screen renders the danger card with the
    // "Type DELETE" copy. Asserting on that text confirms we landed
    // on the right modal before typing the confirmation.
    await expect(element(by.text(/Type DELETE/i))).toBeVisible();
    await element(by.id('da-confirm')).typeText('DELETE');
    await expect(element(by.id('da-delete'))).toBeVisible();
  });
});
