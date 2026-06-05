/**
 * Pens CRUD flow — add, edit, soft-delete.
 *
 * Run with: `pnpm test:e2e -- --spec e2e/pens.e2e.ts`
 */
describe('Pens flow', () => {
  beforeAll(async () => {
    // Assumes the user is already signed in (run auth.e2e.ts first).
    await device.launchApp({ newInstance: false });
  });

  it('adds a pen and shows it in the Pens list', async () => {
    await element(by.id('tab-Pens')).tap();
    await element(by.id('pl-fab')).tap();
    await element(by.id('f-brand')).typeText('Pilot');
    await element(by.id('f-model')).typeText('Capless');
    await element(by.id('f-nibsize-F')).tap();
    await element(by.id('f-nibmat-steel')).tap();
    await element(by.id('f-color')).typeText('#1A1A1A');
    await element(by.id('f-submit')).tap();
    await expect(element(by.text('Pilot'))).toBeVisible();
    await expect(element(by.text('Capless'))).toBeVisible();
  });

  it('opens the pen detail and edits the model name', async () => {
    await element(by.text('Pilot Capless')).tap();
    await element(by.id('pd-edit')).tap();
    await element(by.id('f-model')).clearText();
    await element(by.id('f-model')).typeText('Capless Decimo');
    await element(by.id('f-submit')).tap();
    await expect(element(by.text('Capless Decimo'))).toBeVisible();
  });

  it('soft-deletes the pen from detail', async () => {
    await element(by.id('pd-delete')).tap();
    await element(by.text('Delete')).tap();
    // The pen disappears from the list.
    await expect(element(by.text('Pilot Capless Decimo'))).not.toBeVisible();
  });
});
