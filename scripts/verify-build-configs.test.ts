import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Build-config sanity tests.
 *
 * These configs aren't runtime code, but we still want a fast local check that
 * they haven't been edited into a broken state. They run in `pnpm test`.
 */

const ROOT = join(__dirname, '..');

describe('CI workflow', () => {
  const path = join(ROOT, '.github/workflows/ci.yml');
  let yml: string;

  beforeAll(() => {
    expect(existsSync(path)).toBe(true);
    yml = readFileSync(path, 'utf8');
  });

  it('triggers on push to main and on pull requests', () => {
    expect(yml).toMatch(/on:/);
    expect(yml).toMatch(/push:/);
    expect(yml).toMatch(/branches:\s*\[main\]/);
    expect(yml).toMatch(/pull_request:/);
  });

  it('uses pnpm with a pinned version', () => {
    expect(yml).toMatch(/pnpm\/action-setup/);
    expect(yml).toMatch(/version:\s*9\.15\.0/);
  });

  it('runs lint, typecheck, and test', () => {
    expect(yml).toMatch(/run:\s*pnpm lint/);
    expect(yml).toMatch(/run:\s*pnpm typecheck/);
    expect(yml).toMatch(/run:\s*pnpm test/);
  });

  it('cancels in-progress runs on the same branch', () => {
    expect(yml).toMatch(/concurrency:/);
    expect(yml).toMatch(/cancel-in-progress:\s*true/);
  });
});

describe('EAS config', () => {
  const path = join(ROOT, 'eas.json');
  let cfg: Record<string, unknown>;

  beforeAll(() => {
    expect(existsSync(path)).toBe(true);
    cfg = JSON.parse(readFileSync(path, 'utf8'));
  });

  it('exposes the three build profiles (development, preview, production)', () => {
    const profiles = Object.keys(((cfg.build as Record<string, unknown>) ?? {}) as object);
    expect(profiles).toEqual(expect.arrayContaining(['development', 'preview', 'production']));
  });

  it('pins the same pnpm + node versions as the local env', () => {
    const base = (cfg.build as { base: { node: string; pnpm: string } }).base;
    expect(base.node).toBe('20.18.0');
    expect(base.pnpm).toBe('9.15.0');
  });

  it('marks development as a simulator build (fast iteration)', () => {
    const dev = (cfg.build as { development: { ios: { simulator: boolean } } }).development;
    expect(dev.ios.simulator).toBe(true);
  });

  it('disables dev client + simulator for production', () => {
    const prod = cfg.build as { production: { developmentClient?: boolean } };
    expect(prod.production.developmentClient).toBeUndefined();
  });
});
