// src/hooks/useOnlineStatus.ts
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(!!state.isConnected && !!state.isInternetReachable);
    });

    NetInfo.fetch().then((state) => {
      setOnline(!!state.isConnected && !!state.isInternetReachable);
    });

    return () => unsubscribe();
  }, []);

  return online;
}