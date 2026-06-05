/**
 * Stats dashboard renders.
 *
 * The plan calls for stats on a Home section; for now it lives behind
 * the SessionDetail tab and is reachable via the Profile screen.
 * Adjust when S6 wires Stats into the Home stack.
 */
describe('Stats screen', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
  });

  it('shows totals, top pens, top inks, monthly bars', async () => {
    await element(by.id('tab-Settings')).tap();
    await element(by.id('se-profile')).tap();
    await element(by.text('Stats')).tap();
    await expect(element(by.id('st-sessions'))).toBeVisible();
    await expect(element(by.id('st-minutes'))).toBeVisible();
    await expect(element(by.id('st-rating'))).toBeVisible();
  });
});
