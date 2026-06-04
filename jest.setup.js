// Jest setup — runs before each test file.
// Add global mocks or polyfills here as needed.

// Reanimated mock
require('react-native-reanimated/mock');

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// MMKV is a native module — mock it for tests
jest.mock('react-native-mmkv', () => {
  const store = new Map();
  return {
    MMKV: jest.fn().mockImplementation(() => ({
      set: jest.fn((key, value) => store.set(key, value)),
      getString: jest.fn((key) => store.get(key) ?? undefined),
      getNumber: jest.fn((key) => store.get(key) ?? undefined),
      getBoolean: jest.fn((key) => store.get(key) ?? undefined),
      delete: jest.fn((key) => store.delete(key)),
      clearAll: jest.fn(() => store.clear()),
      contains: jest.fn((key) => store.has(key)),
    })),
  };
});

// NetInfo mock
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn().mockResolvedValue({ isConnected: true, isInternetReachable: true }),
  addEventListener: jest.fn(() => () => {}),
}));

// Silence React Native warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  const msg = args[0];
  if (typeof msg === 'string' && msg.includes('useNativeDriver')) return;
  if (typeof msg === 'string' && msg.includes('Animated:')) return;
  originalWarn(...args);
};
