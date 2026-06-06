/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // pnpm hoists @firebase/auth under a hashed path; redirect it to
    // the actual install so jest (and the TS paths mapping) can find
    // it. We only use initializeAuth + getReactNativePersistence in
    // production; the test mock in jest.setup.js provides safe stubs.
    '^@firebase/auth$': '<rootDir>/node_modules/.pnpm/@firebase+auth@1.7.9_@firebase+app@0.10.13/node_modules/@firebase/auth/dist/rn/index.js',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(?:.pnpm/)?((jest-)?react-native|@react-native(?:-community|-js-polyfills)?|expo(?:nent|-.*)?|@expo(?:nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@react-native-async-storage/async-storage|firebase|@firebase/.*|@react-native-firebase/.*))',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/android/', '/ios/', '/e2e/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    // Navigation glue files are covered by E2E specs (P4.2), not unit
    // tests. The mount-in-react-navigation boilerplate is what makes
    // their unit coverage misleadingly low.
    '!src/app/navigation/**/*.tsx',
    '!src/features/**/navigation/*.tsx',
  ],
  coverageThreshold: {
    global: {
      // Phase 4 (P4.1) targets per tasks/plan.md:
      // 80% lib, 70% hooks, 60% components, 60% overall.
      lines: 65,
      statements: 65,
      functions: 60,
      branches: 55,
    },
    './src/lib/': {
      lines: 80,
      statements: 80,
    },
    './src/features/': {
      // Overall feature target is 60% — index.ts barrel files are
      // excluded from the count because they are pure re-exports.
      lines: 60,
      statements: 60,
    },
  },
};
