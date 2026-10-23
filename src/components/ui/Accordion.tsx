// src/components/ui/Accordion.tsx
import React, { FC, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useThemeStore } from '../../store/useThemeStore';
import { spacing, radius } from '../../theme/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface Props {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const Accordion: FC<Props> = ({ title, icon, children, defaultOpen = false }) => {
  const theme = useThemeStore((s) => s.theme);
  const [open, setOpen] = useState(defaultOpen);
  const rotate = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const to = open ? 0 : 1;
    setOpen(!open);
    Animated.timing(rotate, {
      toValue: to,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const rotation = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
    >
      <Pressable onPress={toggle} style={styles.header}>
        <View style={styles.headerLeft}>
          {icon ? (
            <Ionicons name={icon} size={20} color={theme.colors.primary} style={{ marginRight: spacing.sm }} />
          ) : null}
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate: rotation }] }}>
          <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
        </Animated.View>
      </Pressable>

      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  title: { fontSize: 15, fontWeight: '700' },
  body: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
});

export default Accordion;