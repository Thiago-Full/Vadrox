// src/components/MiniPlayer.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';

import { usePlayerStore } from '../store/usePlayerStore';
import { useThemeStore } from '../store/useThemeStore';
import { skipNext, skipPrevious } from '../services/player';
import { radius, spacing } from '../theme/theme';
import type { RootStackParamList } from '../types/navigation';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SWIPE_THRESHOLD = 60;

export const MiniPlayer: React.FC = () => {
  const navigation = useNavigation<Nav>();
  const theme = useThemeStore((s) => s.theme);
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const toggle = usePlayerStore((s) => s.toggle);

  if (!currentTrack) return null;

  const openPlayer = () => navigation.navigate('Player');
  const handleNext = () => { console.log('[MINIPLAYER] swipe → next'); skipNext(); };
  const handlePrev = () => { console.log('[MINIPLAYER] swipe → prev'); skipPrevious(); };

  const tap = Gesture.Tap().onEnd((_e, success) => {
    if (success) runOnJS(openPlayer)();
  });

  const pan = Gesture.Pan().onEnd((e) => {
    if (e.translationX < -SWIPE_THRESHOLD) runOnJS(handleNext)();
    else if (e.translationX > SWIPE_THRESHOLD) runOnJS(handlePrev)();
  });

  const composed = Gesture.Exclusive(pan, tap);

  return (
    <GestureDetector gesture={composed}>
      <View
        style={[
          styles.container,
          { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
        ]}
      >
        <Image source={{ uri: currentTrack.artwork }} style={styles.artwork} />

        <View style={styles.info}>
          <Text numberOfLines={1} style={[styles.title, { color: theme.colors.text }]}>
            {currentTrack.title}
          </Text>
          <Text numberOfLines={1} style={[styles.artist, { color: theme.colors.textSecondary }]}>
            {currentTrack.artist}
          </Text>
        </View>

        <Pressable onPress={toggle} style={styles.playBtn} hitSlop={12}>
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={24}
            color={theme.colors.text}
          />
        </Pressable>
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  artwork: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: '#222' },
  info: { flex: 1, marginLeft: spacing.md },
  title: { fontSize: 14, fontWeight: '600' },
  artist: { fontSize: 12, marginTop: 2 },
  playBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});

export default MiniPlayer;