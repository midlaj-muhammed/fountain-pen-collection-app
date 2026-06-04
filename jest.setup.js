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

// ── Firebase mocks ─────────────────────────────────────────
// The Web SDK v10 modular build runs in node for unit tests. We mock each
// surface we use with minimal in-memory implementations. Jest requires mock
// factory variables to be prefixed `mock*`.

const mockApps = new Map();

jest.mock('firebase/app', () => {
  return {
    initializeApp: jest.fn((_opts, name) => {
      const n = name ?? '[DEFAULT]';
      if (mockApps.has(n)) return mockApps.get(n);
      const app = { name: n, _opts };
      mockApps.set(n, app);
      return app;
    }),
    getApps: jest.fn(() => Array.from(mockApps.values())),
    getApp: jest.fn((name) => mockApps.get(name ?? '[DEFAULT]')),
  };
});

const mockAuthListeners = new Set();
const mockAuthState = {
  currentUser: { uid: 'mock-uid', email: 'mock@example.com', displayName: null, photoURL: null },
  signOut: jest.fn(async () => {
    mockAuthState.currentUser = null;
    mockAuthListeners.forEach((cb) => cb(mockAuthState.currentUser));
  }),
};

jest.mock('firebase/auth', () => {
  const onAuthStateChanged = jest.fn((_auth, cb) => {
    mockAuthListeners.add(cb);
    cb(mockAuthState.currentUser);
    return () => mockAuthListeners.delete(cb);
  });
  return {
    getAuth: jest.fn(() => mockAuthState),
    onAuthStateChanged,
    signInWithEmailAndPassword: jest.fn(async () => ({ user: mockAuthState.currentUser })),
    signInWithPopup: jest.fn(async () => ({ user: mockAuthState.currentUser })),
    createUserWithEmailAndPassword: jest.fn(async () => ({ user: mockAuthState.currentUser })),
    signOut: jest.fn(async () => undefined),
    GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
  };
});

jest.mock('firebase/firestore', () => {
  const mockCollections = new Map();
  const mockDocPaths = new Map();
  const makeCollection = (segments) => {
    const key = segments.join('/');
    if (!mockCollections.has(key)) {
      mockCollections.set(key, { _path: { segments } });
    }
    return mockCollections.get(key);
  };
  return {
    getFirestore: jest.fn(() => ({ _db: true })),
    collection: jest.fn((_db, ...segments) => makeCollection(segments)),
    doc: jest.fn((_db, ...segments) => {
      const key = segments.join('/');
      if (!mockDocPaths.has(key)) mockDocPaths.set(key, { _path: { segments } });
      return mockDocPaths.get(key);
    }),
    enableIndexedDbPersistence: jest.fn(async () => undefined),
  };
});

jest.mock('firebase/storage', () => {
  const mockRefs = new Map();
  const makeRef = (path) => {
    if (!mockRefs.has(path)) mockRefs.set(path, { _path: path });
    return mockRefs.get(path);
  };
  return {
    getStorage: jest.fn(() => ({ _storage: true })),
    ref: jest.fn((_storage, path) => makeRef(path)),
    uploadBytes: jest.fn(async () => undefined),
    getDownloadURL: jest.fn(async (r) => `https://mock-storage.example.com/${r._path}`),
    deleteObject: jest.fn(async () => undefined),
  };
});

jest.mock('firebase/functions', () => ({
  getFunctions: jest.fn(() => ({ _fn: true })),
}));

// Silence React Native warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  const msg = args[0];
  if (typeof msg === 'string' && msg.includes('useNativeDriver')) return;
  if (typeof msg === 'string' && msg.includes('Animated:')) return;
  originalWarn(...args);
};
