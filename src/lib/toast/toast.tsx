/* eslint-disable react-native/no-raw-text */
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Toast, type ToastKind } from '@/design/components/Toast/Toast';
import { space } from '@/design/tokens/spacing';

export type ToastOptions = {
  message: string;
  kind?: ToastKind;
  /** Override the default 3-second auto-dismiss. */
  durationMs?: number;
};

type ToastContextValue = {
  show: (options: ToastOptions) => void;
  dismiss: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 3000;

export function ToastHost({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<ToastOptions | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setCurrent(null);
  }, []);

  const show = useCallback(
    (options: ToastOptions) => {
      if (timer.current) clearTimeout(timer.current);
      setCurrent(options);
      const duration = options.durationMs ?? DEFAULT_DURATION;
      timer.current = setTimeout(() => {
        setCurrent(null);
        timer.current = null;
      }, duration);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ show, dismiss }}>
      {children}
      {current ? (
        <View pointerEvents="none" style={styles.host}>
          <Toast
            message={current.message}
            {...(current.kind ? { kind: current.kind } : {})}
          />
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used inside a <ToastHost>');
  }
  return ctx;
}

const styles = StyleSheet.create({
  host: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: space.xl,
  },
});
