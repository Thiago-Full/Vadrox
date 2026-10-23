// App.tsx
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppNavigator } from './src/navigation/AppNavigator';
import { useThemeStore } from './src/store/useThemeStore';
import { initTunnelUrl } from './src/services/api';
import OfflineBanner from './src/components/ui/OfflineBanner';

const App: React.FC = () => {
  const mode = useThemeStore((s) => s.mode);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    initTunnelUrl();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <SafeAreaProvider>
        <OfflineBanner />
        <StatusBar
          barStyle={mode === 'dark' ? 'light-content' : 'dark-content'}
          translucent
          backgroundColor="transparent"
        />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;