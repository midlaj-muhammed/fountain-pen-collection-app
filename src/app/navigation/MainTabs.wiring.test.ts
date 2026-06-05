/**
 * Static wiring test: prove that MainTabs actually mounts the new
 * SettingsStack instead of the old placeholder. We avoid mounting
 * the navigator (which requires transforming
 * @react-navigation/elements) and instead read the source file as
 * text to assert the import + render are wired.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

describe('MainTabs — Settings tab wiring', () => {
  it('imports SettingsStack', () => {
    const src = readFileSync(join(__dirname, 'MainTabs.tsx'), 'utf8');
    expect(src).toMatch(
      /import\s*\{\s*SettingsStack\s*\}\s*from\s*'@\/features\/settings\/navigation\/SettingsStack'/,
    );
  });

  it('mounts SettingsStack for the Settings tab (no placeholder)', () => {
    const src = readFileSync(join(__dirname, 'MainTabs.tsx'), 'utf8');
    // The Settings tab should use component={SettingsStack}, not a
    // <Placeholder> child.
    const settingsScreenBlock = src.match(
      /<Tab\.Screen[^>]*\bname="Settings"[\s\S]*?\/>/,
    );
    expect(settingsScreenBlock).toBeTruthy();
    expect(settingsScreenBlock![0]).toMatch(/component=\{SettingsStack\}/);
    expect(settingsScreenBlock![0]).not.toMatch(/Placeholder/);
  });
});
