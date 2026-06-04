/* eslint-env node */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: { project: './tsconfig.json' },
      node: { extensions: ['.js', '.jsx', '.ts', '.tsx'] },
    },
  },
  env: {
    'es2022': true,
    'jest': true,
    'node': true,
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native', 'import', 'jsx-a11y'],
  extends: [
    'expo',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jsx-a11y/recommended',
  ],
  rules: {
    // The 'expo' config still references ban-types which was removed in
    // @typescript-eslint v8. Disable it explicitly so it doesn't error.
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/consistent-type-imports': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    'react/prop-types': 'off',
    'react-native/no-inline-styles': 'off',
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-unresolved': 'off', // handled by TS
  },
  overrides: [
    {
      files: ['**/*.test.tsx', '**/*.test.ts'],
      rules: {
        // Test fixtures use raw text inside <View> for setup convenience;
        // shipping code never does, so disable for test files only.
        'react-native/no-raw-text': 'off',
      },
    },
  ],
  ignorePatterns: [
    'node_modules/',
    'android/',
    'ios/',
    'functions/',
    'e2e/',
    '.expo/',
    'coverage/',
    '*.config.js',
    'babel.config.js',
    'metro.config.js',
  ],
};
