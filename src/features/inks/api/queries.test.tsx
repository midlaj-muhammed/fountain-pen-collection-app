/* eslint-disable react-native/no-raw-text */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { AuthProvider, ThemeProvider } from '@/app/providers';
import { upsertInk } from '@/features/inks/api/inks';
import {
  useCreateInk,
  useDeleteInk,
  useInk,
  useInks,
  useUpdateInk,
} from '@/features/inks/api/queries';

const TEST_UID = 'alice-uid';

function withClient<T>(hook: () => T) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <AuthProvider>{children}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
  return renderHook(hook, { wrapper });
}

// eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
const firestoreMock = require('firebase/firestore') as { __resetMock: () => void };

describe('inks query hooks (shared client)', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });

  it('useInks returns the seeded list', async () => {
    await upsertInk(TEST_UID, 'i1', {
      brand: 'Pelikan',
      name: '4001',
      colorHex: '#2D5D3F',
      colorName: 'Dark Green',
      bottleSizeMl: 30,
      currentLevelPct: 60,
      isCartridge: false,
      photoURL: null,
      acquiredAt: null,
      empty: false,
      totalSessions: 0,
      lastUsedAt: null,
      notes: '',
    });
    const { result } = withClient(() => useInks(TEST_UID));
    await waitFor(() => {
      expect(result.current.data?.length).toBe(1);
    });
  });

  it('useInk returns a single ink', async () => {
    await upsertInk(TEST_UID, 'i1', {
      brand: 'Iroshizuku',
      name: 'Kon-peki',
      colorHex: '#0044CC',
      colorName: 'Deep Sea Blue',
      bottleSizeMl: 50,
      currentLevelPct: 80,
      isCartridge: false,
      photoURL: null,
      acquiredAt: null,
      empty: false,
      totalSessions: 0,
      lastUsedAt: null,
      notes: '',
    });
    const { result } = withClient(() => useInk(TEST_UID, 'i1'));
    await waitFor(() => {
      expect(result.current.data?.name).toBe('Kon-peki');
    });
  });

  it('useCreateInk + useUpdateInk + useDeleteInk drive the list', async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={client}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
    const { result: createResult } = renderHook(() => useCreateInk(TEST_UID), { wrapper });
    const { result: updateResult } = renderHook(() => useUpdateInk(TEST_UID), { wrapper });
    const { result: deleteResult } = renderHook(() => useDeleteInk(TEST_UID), { wrapper });
    const { result: listResult } = renderHook(() => useInks(TEST_UID), { wrapper });

    await act(async () => {
      await createResult.current.mutateAsync({
        brand: 'Pelikan',
        name: '4001',
        colorHex: '#2D5D3F',
        colorName: 'Dark Green',
        bottleSizeMl: 30,
        currentLevelPct: 60,
        isCartridge: false,
        photoURL: null,
        acquiredAt: null,
        empty: false,
        totalSessions: 0,
        lastUsedAt: null,
        notes: '',
      });
    });
    await waitFor(() => {
      expect(listResult.current.data?.length).toBe(1);
    });
    const newId = listResult.current.data![0]!.id;

    await act(async () => {
      await updateResult.current.mutateAsync({ inkId: newId, patch: { currentLevelPct: 40 } });
    });
    await waitFor(() => {
      expect(listResult.current.data?.[0]?.currentLevelPct).toBe(40);
    });

    await act(async () => {
      await deleteResult.current.mutateAsync(newId);
    });
    await waitFor(() => {
      expect(listResult.current.data?.length).toBe(0);
    });
  });
});
