/**
 * Inks CRUD + bottle/cartridge toggle.
 */
describe('Inks flow', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
  });

  it('adds a bottle ink with level 60%', async () => {
    await element(by.id('tab-Inks')).tap();
    await element(by.id('il-fab')).tap();
    await element(by.id('f-brand')).typeText('Pelikan');
    await element(by.id('f-name')).typeText('4001');
    await element(by.id('f-colorHex')).typeText('#2D5D3F');
    await element(by.id('f-colorName')).typeText('Dark Green');
    await element(by.id('f-bottleSizeMl')).clearText();
    await element(by.id('f-bottleSizeMl')).typeText('30');
    await element(by.id('f-level-60')).tap();
    await element(by.id('f-submit')).tap();
    await expect(element(by.text('Pelikan'))).toBeVisible();
  });

  it('switches to Cartridges view when no cartridge inks exist', async () => {
    await element(by.id('il-toggle-cartridges')).tap();
    await expect(element(by.text('No cartridges yet'))).toBeVisible();
  });
});
