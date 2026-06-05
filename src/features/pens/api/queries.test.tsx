/* eslint-disable react-native/no-raw-text */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useState } from 'react';

import { AuthProvider, ThemeProvider } from '@/app/providers';
import {
  useCreatePen,
  useDeletePen,
  usePen,
  usePens,
  useUpdatePen,
} from '@/features/pens/api/queries';
import { upsertPen } from '@/features/pens/api/pens';

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

describe('pens query hooks (shared client)', () => {
  beforeEach(() => {
    firestoreMock.__resetMock();
  });

  it('usePens returns the seeded list', async () => {
    await upsertPen(TEST_UID, 'p1', {
      brand: 'Pilot',
      model: 'Capless',
      nib: { size: 'F', material: 'steel', customLabel: null },
      color: '#1A1A1A',
      photoURL: null,
      acquiredAt: null,
      retired: false,
      currentInkId: null,
      notes: '',
      totalSessions: 0,
    });
    const { result } = withClient(() => usePens(TEST_UID));
    await waitFor(() => {
      expect(result.current.data?.length).toBe(1);
    });
    expect(result.current.data?.[0]?.brand).toBe('Pilot');
  });

  it('usePen returns a single pen', async () => {
    await upsertPen(TEST_UID, 'p1', {
      brand: 'Lamy',
      model: '2000',
      nib: { size: 'M', material: 'steel', customLabel: null },
      color: '#000000',
      photoURL: null,
      acquiredAt: null,
      retired: false,
      currentInkId: null,
      notes: '',
      totalSessions: 0,
    });
    const { result } = withClient(() => usePen(TEST_UID, 'p1'));
    await waitFor(() => {
      expect(result.current.data?.brand).toBe('Lamy');
    });
  });

  it('useCreatePen + useUpdatePen + useDeletePen drive the list through React Query', async () => {
    // We share one QueryClient so the create/update/delete mutations
    // invalidate the list query and re-render the read.
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

    const { result: createResult } = renderHook(() => useCreatePen(TEST_UID), { wrapper });
    const { result: updateResult } = renderHook(() => useUpdatePen(TEST_UID), { wrapper });
    const { result: deleteResult } = renderHook(() => useDeletePen(TEST_UID), { wrapper });
    // Mount a small consumer that exposes the pens list and re-renders
    // when the cache invalidates.
    function ListProbe() {
      const pens = usePens(TEST_UID);
      const [, force] = useState(0);
      // Re-render ourselves when the cache version changes
      force((v) => v + 1);
      return pens.data?.length ?? 0;
    }
    const { result: listResult } = renderHook(() => usePens(TEST_UID), { wrapper });
    void ListProbe;

    await act(async () => {
      await createResult.current.mutateAsync({
        brand: 'Pilot',
        model: 'Capless',
        nib: { size: 'F', material: 'steel', customLabel: null },
        color: '#1A1A1A',
        photoURL: null,
        acquiredAt: null,
        retired: false,
        currentInkId: null,
        notes: '',
        totalSessions: 0,
      });
    });
    await waitFor(() => {
      expect(listResult.current.data?.length).toBe(1);
    });
    const newId = listResult.current.data![0]!.id;

    await act(async () => {
      await updateResult.current.mutateAsync({
        penId: newId,
        patch: { model: 'Capless Decimo' },
      });
    });
    await waitFor(() => {
      expect(listResult.current.data?.[0]?.model).toBe('Capless Decimo');
    });

    await act(async () => {
      await deleteResult.current.mutateAsync(newId);
    });
    await waitFor(() => {
      expect(listResult.current.data?.length).toBe(0);
    });
  });
});
