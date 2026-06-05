/* eslint-disable react-native/no-raw-text */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

import { AuthProvider, ThemeProvider } from '@/app/providers';
import { ToastHost, useToast } from '@/lib/toast/toast';

/**
 * Regression test for the App.tsx ToastHost wiring bug.
 *
 * Original App.tsx mounted <ToastHost>{null}</ToastHost> as a sibling
 * of RootNavigator. Result: useToast() threw on any navigator-mounted
 * screen. The fix wraps RootNavigator inside ToastHost.
 *
 * Two layers of coverage:
 *   1. Contract tests below prove the ToastHost behaviour in isolation.
 *   2. The "App.tsx structure" test reads the real file and asserts
 *      that it wraps the navigator with <ToastHost>...</ToastHost>.
 *
 * The App.tsx file itself is not mounted here because it pulls in
 * react-native-gesture-handler which can't init under jest-expo.
 */

function Probe() {
  const toast = useToast();
  return (
    <Pressable testID="probe" onPress={() => toast.show({ message: 'hi' })}>
      <Text>probe</Text>
    </Pressable>
  );
}

function BrokenApp() {
  // Mirrors the BROKEN shape: ToastHost is a sibling, not a parent.
  return (
    <View>
      <ToastHost>{null}</ToastHost>
      <Probe />
    </View>
  );
}

function FixedApp() {
  // Mirrors the FIXED shape: ToastHost wraps the navigator/screen tree.
  return (
    <ToastHost>
      <Probe />
    </ToastHost>
  );
}

function withProviders(node: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>
        <AuthProvider>{node}</AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

describe('ToastHost wiring', () => {
  it('useToast() throws when the host does not wrap the consumer (the bug)', () => {
    // Suppress the noisy React error boundary console.error so the
    // test output is readable.
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    expect(() => render(withProviders(<BrokenApp />))).toThrow(
      /useToast must be used inside a <ToastHost>/,
    );
    errSpy.mockRestore();
  });

  it('useToast() works when the host wraps the consumer (the fix)', () => {
    expect(() => render(withProviders(<FixedApp />))).not.toThrow();
  });
});

describe('App.tsx — ToastHost wraps RootNavigator', () => {
  it('the source file wraps <RootNavigator /> inside <ToastHost>', () => {
    const src = readFileSync(join(__dirname, 'App.tsx'), 'utf8');
    // Either: <ToastHost><RootNavigator /></ToastHost>
    // Or:     <ToastHost>...<RootNavigator />...</ToastHost>
    // We accept both — the structural rule is "RootNavigator is a
    // descendant of ToastHost".
    const hostOpen = src.indexOf('<ToastHost');
    const hostClose = src.indexOf('</ToastHost>');
    const navOpen = src.indexOf('<RootNavigator');
    expect(hostOpen).toBeGreaterThan(-1);
    expect(hostClose).toBeGreaterThan(hostOpen);
    expect(navOpen).toBeGreaterThan(hostOpen);
    expect(navOpen).toBeLessThan(hostClose);
    // Also: must not have <ToastHost>{null}</ToastHost>
    expect(src).not.toMatch(/<ToastHost>\s*\{null\}\s*<\/ToastHost>/);
  });
});
