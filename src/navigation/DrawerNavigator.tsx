// src/navigation/DrawerNavigator.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import type { BottomTabParamList, DrawerParamList } from '../types/navigation';
import { BottomTabs } from './BottomTabs';
import ConfigScreen from '../screens/ConfigScreen';
import HistoryScreen from '../screens/HistoryScreen';
import { useThemeStore } from '../store/useThemeStore';
import { spacing, radius } from '../theme/theme';
import AiAssistant from '../components/AiAssistant';

const Drawer = createDrawerNavigator<DrawerParamList>();

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
  const theme = useThemeStore((s) => s.theme);
  const insets = useSafeAreaInsets();
  const { navigation } = props;
  const [search, setSearch] = useState('');

  const goToTab = (tab: keyof BottomTabParamList) => {
    navigation.navigate('MainTabs', { screen: tab });
  };

  const handleSearch = () => {
    if (!search.trim()) return;
    navigation.navigate('MainTabs', {
      screen: 'Search',
      params: { initialQuery: search.trim(), _ts: Date.now() },
    } as any);
    setSearch('');
    navigation.closeDrawer();
  };

  return (
    <View style={[styles.drawerRoot, { backgroundColor: theme.colors.background }]}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ paddingTop: insets.top + spacing.md }}
      >
        <View style={styles.brandBlock}>
          <Text style={[styles.brand, { color: theme.colors.text }]}>Vadrox</Text>
          <Text style={[styles.brandSub, { color: theme.colors.textSecondary }]}>
            player premium
          </Text>
        </View>

        <DrawerItemList {...props} />

        <DrawerItem
          label="Biblioteca"
          icon={({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          )}
          labelStyle={{ color: theme.colors.text }}
          onPress={() => goToTab('Library')}
        />
        <DrawerItem
          label="Perfil"
          icon={({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          )}
          labelStyle={{ color: theme.colors.text }}
          onPress={() => goToTab('Profile')}
        />
      </DrawerContentScrollView>

      <View
        style={[
          styles.drawerFooter,
          {
            borderTopColor: theme.colors.border,
            paddingBottom: insets.bottom + spacing.md,
          },
        ]}
      >
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Ionicons name="search" size={16} color={theme.colors.textSecondary} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            placeholder="Buscar..."
            placeholderTextColor={theme.colors.textTertiary}
            style={[styles.searchInput, { color: theme.colors.text }]}
          />
          <AiAssistant variant="icon" size={18} />
        </View>
      </View>
    </View>
  );
};

export const DrawerNavigator: React.FC = () => {
  const theme = useThemeStore((s) => s.theme);

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.text,
        drawerStyle: { backgroundColor: theme.colors.background, width: 280 },
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={BottomTabs}
        options={{
          title: 'Início',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: 'Histórico',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Config"
        component={ConfigScreen}
        options={{
          title: 'Configurações',
          drawerIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  drawerRoot: { flex: 1 },
  brandBlock: { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg },
  brand: { fontSize: 24, fontWeight: '800', letterSpacing: 1 },
  brandSub: { fontSize: 12, marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  drawerFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  searchInput: { flex: 1, fontSize: 14, padding: 0 },
});

export default DrawerNavigator;