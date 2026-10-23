// src/components/AiAssistant.tsx
import React, { FC } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useThemeStore } from '../store/useThemeStore';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface AiAssistantProps {
  size?: number;
  variant?: 'icon' | 'circle';
}

const AiAssistant: FC<AiAssistantProps> = ({ size = 22, variant = 'circle' }) => {
  const navigation = useNavigation<Nav>();
  const theme = useThemeStore((s) => s.theme);

  if (variant === 'icon') {
    return (
      <Pressable onPress={() => navigation.navigate('Chatbot')} hitSlop={12} style={styles.iconWrapper}>
        <Ionicons name="sparkles" size={size} color={theme.colors.primary} />
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => navigation.navigate('Chatbot')}
      style={({ pressed }) => [
        styles.circle,
        { backgroundColor: theme.colors.primary, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Ionicons name="sparkles" size={size} color="#FFF" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  iconWrapper: { padding: 8 },
  circle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AiAssistant;