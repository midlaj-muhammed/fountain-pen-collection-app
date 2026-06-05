/**
 * API-surface test for the SettingsStack.
 *
 * Today this file does not exist; importing it must throw. Once we
 * add SettingsStack.tsx with a `SettingsStack` export, the import
 * resolves and the assertion passes. The ParamList type is erased
 * at runtime; we only check the function shape.
 */
describe('SettingsStack module surface', () => {
  it('exposes a SettingsStack React component', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    const mod = require('./SettingsStack') as { SettingsStack?: unknown };
    expect(typeof mod.SettingsStack).toBe('function');
  });
});
