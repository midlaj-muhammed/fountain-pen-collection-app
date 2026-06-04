import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type NetInfoContextValue = {
  isOnline: boolean;
};

const NetInfoContext = createContext<NetInfoContextValue>({ isOnline: true });

export function NetInfoProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      // Some Android emulators report `isInternetReachable: null` even when
      // connected; treat null as online so we don't show a false offline banner.
      const reachable = state.isInternetReachable !== false;
      setIsOnline(Boolean(state.isConnected) && reachable);
    });
    return () => unsubscribe();
  }, []);

  return <NetInfoContext.Provider value={{ isOnline }}>{children}</NetInfoContext.Provider>;
}

export function useIsOnline(): boolean {
  return useContext(NetInfoContext).isOnline;
}
