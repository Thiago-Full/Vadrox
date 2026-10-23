// src/navigation/BottomTabs.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabBar,
} from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import type { BottomTabParamList } from '../types/navigation';
import MiniPlayer from '../components/MiniPlayer';
import { usePlayerStore } from '../store/usePlayerStore';
import { useThemeStore } from '../store/useThemeStore';

import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import BibliotecaScreen from '../screens/BibliotecaScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const ICONS: Record<keyof BottomTabParamList, { active: string; inactive: string }> = {
  Home:    { active: 'home',    inactive: 'home-outline' },
  Search:  { active: 'search',  inactive: 'search-outline' },
  Library: { active: 'library', inactive: 'library-outline' },
  Profile: { active: 'person',  inactive: 'person-outline' },
};

export const BottomTabs: React.FC = () => {
  const theme = useThemeStore((s) => s.theme);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 58 + insets.bottom,     // <-- soma safe area
          paddingTop: 6,
          paddingBottom: insets.bottom + 6, // <-- sobe o conteúdo
        },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons
            name={focused ? ICONS[route.name].active : ICONS[route.name].inactive}
            size={size ?? 24}
            color={color}
          />
        ),
      })}
      tabBar={(props) => (
        <View style={{ backgroundColor: theme.colors.background }}>
          {currentTrack ? <MiniPlayer /> : null}
          <BottomTabBar {...props} />
        </View>
      )}
    >
      <Tab.Screen name="Home"    component={HomeScreen} />
      <Tab.Screen name="Search"  component={SearchScreen} />
      <Tab.Screen name="Library" component={BibliotecaScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};