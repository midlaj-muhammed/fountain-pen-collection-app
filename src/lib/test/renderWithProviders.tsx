import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react-native';
import { type ReactElement } from 'react';

import { AuthProvider, ThemeProvider } from '@/app/providers';

/**
 * Test helper that wraps a component in the same providers the real app uses.
 * Each call gets a fresh QueryClient so caches don't leak between tests.
 */
export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  function Wrap({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={client}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }
  return render(ui, { wrapper: Wrap, ...options });
}
