// src/components/ui/OfflineBanner.tsx
import React, { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useThemeStore } from '../../store/useThemeStore';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { spacing } from '../../theme/theme';

const OfflineBanner: FC = () => {
  const theme = useThemeStore((s) => s.theme);
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <View style={[styles.banner, { backgroundColor: theme.colors.danger }]}>
      <Ionicons name="cloud-offline" size={14} color="#FFF" />
      <Text style={styles.text}>
        Sem conexão — só as músicas baixadas vão tocar
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default OfflineBanner;