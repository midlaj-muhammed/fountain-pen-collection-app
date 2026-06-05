import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useEffect, useState } from 'react';

import { enableOfflinePersistence } from '@/lib/firebase';

/**
 * Wraps the app in a TanStack Query client. Defaults are tuned for a mobile
 * app: long stale time (data changes via Firestore, not via revalidation),
 * retry once, and exponential backoff. Also flips on Firestore offline
 * persistence on mount.
 */
export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // 1 minute — Firestore pushes updates via onSnapshot
            gcTime: 1000 * 60 * 5, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
          },
        },
      }),
  );

  useEffect(() => {
    enableOfflinePersistence();
  }, []);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
