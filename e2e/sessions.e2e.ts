/**
 * Sessions — list, filter, delete.
 */
describe('Sessions flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
  });

  it('shows the sessions list grouped by Today', async () => {
    await element(by.id('tab-Pens')).tap();
    await element(by.text('Sessions')).tap();
    await expect(element(by.text('Today'))).toBeVisible();
  });
});
