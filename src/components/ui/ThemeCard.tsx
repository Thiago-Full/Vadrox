// src/components/ui/ThemeCard.tsx
import React, { FC } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';

import { useThemeStore } from '../../store/useThemeStore';
import { ThemePreset, spacing, radius } from '../../theme/theme';

interface Props {
  preset: ThemePreset;
  isActive: boolean;
  onPress: () => void;
}

const ThemeCard: FC<Props> = ({ preset, isActive, onPress }) => {
  const theme = useThemeStore((s) => s.theme);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: isActive ? preset.primary : theme.colors.border,
          borderWidth: isActive ? 2 : StyleSheet.hairlineWidth,
        },
      ]}
    >
      {/* Preview: gradiente + balão com formato do tema */}
      <View style={styles.previewWrapper}>
        <LinearGradient
          colors={[preset.primary, preset.backgroundDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.previewGradient}
        >
          <View
            style={[
              styles.miniBubble,
              {
                backgroundColor: preset.bubbleColor,
                borderTopLeftRadius: preset.bubbleStyle.topLeft / 2,
                borderTopRightRadius: preset.bubbleStyle.topRight / 2,
                borderBottomLeftRadius: preset.bubbleStyle.bottomLeft / 2,
                borderBottomRightRadius: preset.bubbleStyle.bottomRight / 2,
                borderWidth: preset.bubbleStyle.borderWidth,
                borderColor: preset.primary,
              },
            ]}
          />
        </LinearGradient>
      </View>

      {/* Info */}
      <View style={styles.info}>
        <View style={[styles.iconCircle, { backgroundColor: `${preset.primary}22` }]}>
          <Ionicons name={preset.icon as any} size={14} color={preset.primary} />
        </View>
        <Text
          numberOfLines={1}
          style={[styles.name, { color: theme.colors.text }]}
        >
          {preset.name}
        </Text>
        {isActive && (
          <Ionicons name="checkmark-circle" size={16} color={preset.primary} />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  previewWrapper: {
    height: 90,
    overflow: 'hidden',
  },
  previewGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBubble: {
    width: 50,
    height: 22,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  iconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ThemeCard;