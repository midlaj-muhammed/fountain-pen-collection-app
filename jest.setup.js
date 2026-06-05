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
    connectAuthEmulator: jest.fn(),
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
  const mockDocuments = new Map();
  const makeCollection = (segments) => {
    const key = segments.join('/');
    if (!mockCollections.has(key)) {
      mockCollections.set(key, { _path: { segments } });
    }
    return mockCollections.get(key);
  };
  const makeDocRef = (segments) => {
    const key = segments.join('/');
    if (!mockDocPaths.has(key)) mockDocPaths.set(key, { _path: { segments } });
    return mockDocPaths.get(key);
  };
  const api = {
    getFirestore: jest.fn(() => ({ _db: true })),
    collection: jest.fn((_db, ...segments) => makeCollection(segments)),
    doc: jest.fn((...args) => {
      // Support both doc(db, ...segments) and doc(collectionRef, id)
      if (args.length === 1) return makeDocRef(['_root']);
      const first = args[0];
      if (first && typeof first === 'object' && '_path' in first) {
        // Called as doc(collectionRef, id) — extend the collection's path
        const tail = args.slice(1);
        return makeDocRef([...first._path.segments, ...tail]);
      }
      // Called as doc(db, ...segments)
      return makeDocRef(args.slice(1));
    }),
    getDoc: jest.fn(async (ref) => {
      const key = ref._path.segments.join('/');
      const data = mockDocuments.get(key);
      return { exists: () => data !== undefined, data: () => data, id: ref._path.segments[ref._path.segments.length - 1] };
    }),
    getDocs: jest.fn(async (ref) => {
      const refPath = ref._path?.segments ?? [];
      const prefix = refPath.join('/') + '/';
      const constraints = ref._constraints ?? [];
      const docs = [];
      for (const [key, data] of mockDocuments.entries()) {
        if (!key.startsWith(prefix)) continue;
        // Apply where() constraints
        let include = true;
        for (const c of constraints) {
          if (c && c._kind === 'where') {
            if (data[c.field] !== c.value) {
              include = false;
              break;
            }
          }
        }
        if (!include) continue;
        const id = key.slice(prefix.length);
        docs.push({ id, data: () => data, exists: () => true });
      }
      return { docs, forEach: (cb) => docs.forEach((d) => cb(d)), empty: docs.length === 0, size: docs.length };
    }),
    addDoc: jest.fn(async (ref, data) => {
      const id = `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const key = ref._path.segments.join('/') + '/' + id;
      mockDocuments.set(key, { ...data, id });
      return { id, _path: { segments: [...ref._path.segments, id] } };
    }),
    setDoc: jest.fn(async (ref, data) => {
      const key = ref._path.segments.join('/');
      mockDocuments.set(key, { ...data, id: ref._path.segments[ref._path.segments.length - 1] });
    }),
    updateDoc: jest.fn(async (ref, data) => {
      const key = ref._path.segments.join('/');
      const existing = mockDocuments.get(key) ?? {};
      mockDocuments.set(key, { ...existing, ...data });
    }),
    deleteDoc: jest.fn(async (ref) => {
      const key = ref._path.segments.join('/');
      mockDocuments.delete(key);
    }),
    query: jest.fn((ref, ...constraints) => {
      // Return a ref-like object carrying the constraints so getDocs can
      // apply them. The base ref's _path is what we filter on.
      return { _path: ref._path, _constraints: constraints };
    }),
    where: jest.fn((field, op, value) => ({ _kind: 'where', field, op, value })),
    orderBy: jest.fn((field, dir) => ({ _kind: 'orderBy', field, dir })),
    onSnapshot: jest.fn(() => () => {}),
    serverTimestamp: jest.fn(() => ({ _serverTimestamp: true })),
    Timestamp: { now: () => ({ seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date() }) },
    enableIndexedDbPersistence: jest.fn(async () => undefined),
    connectFirestoreEmulator: jest.fn(),
  };
  // Test-only escape hatch: lets tests reset in-memory state between cases.
  api.__resetMock = () => {
    mockDocuments.clear();
    mockCollections.clear();
    mockDocPaths.clear();
  };
  return api;
});

// Reset helper for in-memory Firestore state between tests. Exposed as a
// global so feature tests can call it in beforeEach.
global.__resetFirestoreMock = () => {
  // We can't reach the closure-scoped Maps from here, so we use jest.resetModules
  // and force a re-require in the consuming test. The cleaner API: tests
  // call `jest.isolateModules` to opt into a fresh module graph per test.
  // The simpler universal fix: any test that needs isolation can call
  //   jest.resetModules();
  //   require('...');  // re-require the affected module
  // and the in-memory state is gone.
};

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
    connectStorageEmulator: jest.fn(),
  };
});

jest.mock('firebase/functions', () => {
  const fn = { _fn: true };
  return {
    getFunctions: jest.fn(() => fn),
    connectFunctionsEmulator: jest.fn(),
  };
});

// Silence React Native warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  const msg = args[0];
  if (typeof msg === 'string' && msg.includes('useNativeDriver')) return;
  if (typeof msg === 'string' && msg.includes('Animated:')) return;
  originalWarn(...args);
};

// @react-navigation/elements requires PNG assets at import time
// (Assets array). jest-expo can't transform those, so we provide a
// stub that exposes the same shape the library expects.
jest.mock('@react-navigation/elements', () => {
  const React = require('react');
  const { View, Text } = require('react-native');
  const passthrough = (name) => {
    const C = ({ children, ...rest }) => React.createElement(View, rest, children);
    C.displayName = name;
    return C;
  };
  return {
    Assets: [],
    SafeAreaProviderCompat: passthrough('SafeAreaProviderCompat'),
    Screen: passthrough('Screen'),
    ScreenContainer: passthrough('ScreenContainer'),
    ScreenContent: passthrough('ScreenContent'),
    ScreenFallback: passthrough('ScreenFallback'),
    ScreenHeader: passthrough('ScreenHeader'),
    Header: passthrough('Header'),
    HeaderBackButton: passthrough('HeaderBackButton'),
    HeaderBackground: passthrough('HeaderBackground'),
    HeaderTitle: passthrough('HeaderTitle'),
    MissingIcon: () => React.createElement(Text, null, '?'),
    getDefaultHeaderHeight: () => 56,
    getNamedContext: (name) =>
      React.createContext(undefined).displayName || name || 'Context',
    useHeaderHeight: () => 56,
  };
});
