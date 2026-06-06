// Learn more https://docs.expo.dev/guides/customizing-metro
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// pnpm hoists the internal `@firebase/auth` package under a hashed
// path. Metro's default resolver walks node_modules upward and never
// finds it (it's a transitive dep of `firebase`, not a direct one
// in package.json), so `import '@firebase/auth'` errors out at bundle
// time. `extraNodeModules` injects a virtual mapping that makes
// `@firebase/auth` resolvable to the pnpm path. Jest uses the same
// path via its own `moduleNameMapper` in jest.config.js.
const FIREBASE_AUTH_PNPM_DIR = path.resolve(
  __dirname,
  'node_modules/.pnpm/@firebase+auth@1.7.9_@firebase+app@0.10.13/node_modules/@firebase/auth',
);
config.resolver = config.resolver || {};
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules || {}),
  '@firebase/auth': FIREBASE_AUTH_PNPM_DIR,
};

module.exports = config;
