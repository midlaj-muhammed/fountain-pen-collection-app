/**
 * Delete account — full flow including the Cloud Function call.
 * Requires the deployed `deleteUserData` function (or a local
 * Functions emulator).
 */
describe('Delete account', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
  });

  it('deletes the account after typing DELETE and returns to Welcome', async () => {
    await element(by.id('tab-Settings')).tap();
    await element(by.id('se-delete-account')).tap();
    await element(by.id('da-confirm')).typeText('DELETE');
    await element(by.id('da-delete')).tap();
    await expect(element(by.text('Welcome to MyPen'))).toBeVisible();
  });
});
