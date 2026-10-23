// src/navigation/AppNavigator.tsx
import React from 'react';
import {
  NavigationContainer,
  DefaultTheme as NavLight,
  DarkTheme as NavDark,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { RootStackParamList } from '../types/navigation';
import { DrawerNavigator } from './DrawerNavigator';
import { useThemeStore } from '../store/useThemeStore';

import PlayerScreen from '../screens/PlayerScreen';
import ChatbotScreen from '../screens/ChatbotScreen';
import PlaylistScreen from '../screens/PlaylistScreen';
import AiSuggestionsScreen from '../screens/AiSuggestionsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const theme = useThemeStore((s) => s.theme);

  const base = theme.mode === 'dark' ? NavDark : NavLight;
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.background,
      text: theme.colors.text,
      border: theme.colors.border,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen name="Drawer" component={DrawerNavigator} />

        <Stack.Screen
          name="Player"
          component={PlayerScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />

        <Stack.Screen
          name="Chatbot"
          component={ChatbotScreen}
          options={{ animation: 'slide_from_right' }}
        />

        <Stack.Screen
          name="Playlist"
          component={PlaylistScreen}
          options={{ animation: 'slide_from_right' }}
        />

        <Stack.Screen
          name="AiSuggestions"
          component={AiSuggestionsScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};