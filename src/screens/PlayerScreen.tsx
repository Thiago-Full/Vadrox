// src/screens/PlayerScreen.tsx
import React, { FC, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { useProgress } from '@rntp/player';

import { useThemeStore } from '../store/useThemeStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { seekToPosition, setShuffle, setRepeat, setPlaybackSpeed } from '../services/player';
import { spacing, radius, shadows } from '../theme/theme';
import TrackOptionsModal from '../components/ui/TrackOptionsModal';


const { width } = Dimensions.get('window');
const COVER_SIZE = width - spacing.xl * 2;

const fmt = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

const PlayerScreen: FC = () => {
  const navigation = useNavigation();
  const theme = useThemeStore((s) => s.theme);
  const { currentTrack, isPlaying, toggle, next, previous } = usePlayerStore();

  const progress = useProgress(0.5);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [dragging, setDragging] = useState<number | null>(null);
  const [shuffle, setShuffleState] = useState(false);
  const [repeat, setRepeatState] = useState<'off' | 'queue' | 'track'>('off');
  const [speed, setSpeed] = useState(1.0);

  const toggleShuffle = () => {
    const next = !shuffle;
    setShuffleState(next);
    setShuffle(next);
  };

  const toggleRepeat = () => {
    const modes: ('off' | 'queue' | 'track')[] = ['off', 'queue', 'track'];
    const idx = modes.indexOf(repeat);
    const next = modes[(idx + 1) % modes.length];
    setRepeatState(next);
    setRepeat(next);
  };

  if (!currentTrack) return null;

  const duration = progress.duration || currentTrack.duration || 1;
  const livePosition = progress.position ?? 0;
  const sliderValue = dragging !== null ? dragging : livePosition;
const cycleSpeed = () => {
  const speeds = [1.0, 1.25, 1.5, 2.0, 0.5];
  const idx = speeds.indexOf(speed);
  const next = speeds[(idx + 1) % speeds.length];
  setSpeed(next);
  setPlaybackSpeed(next);
};
  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="chevron-down" size={26} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.textSecondary }]}>
            Tocando Agora
          </Text>
          <Pressable onPress={() => setOptionsOpen(true)} hitSlop={12}>
            <Ionicons name="ellipsis-horizontal" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        <View style={styles.coverWrapper}>
          <Image
            source={{ uri: currentTrack.artwork }}
            style={[styles.cover, { backgroundColor: theme.colors.surfaceLight }, shadows.lg]}
          />
        </View>

        <View style={styles.meta}>
          <Text numberOfLines={2} style={[styles.title, { color: theme.colors.text }]}>
            {currentTrack.title}
          </Text>
          <Text numberOfLines={1} style={[styles.artist, { color: theme.colors.textSecondary }]}>
            {currentTrack.artist}
          </Text>
        </View>

        <View style={styles.progressBlock}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={sliderValue}
            minimumTrackTintColor={theme.colors.primary}
            maximumTrackTintColor={theme.colors.border}
            thumbTintColor={theme.colors.primary}
            onValueChange={setDragging}
            onSlidingComplete={(v) => {
              seekToPosition(v);
              setDragging(null);
            }}
          />
          <View style={styles.timeRow}>
            <Text style={[styles.time, { color: theme.colors.textTertiary }]}>
              {fmt(sliderValue)}
            </Text>
            <Text style={[styles.time, { color: theme.colors.textTertiary }]}>
              {fmt(duration)}
            </Text>
          </View>
        </View>

        {/* Shuffle + Repeat */}
        <View style={styles.secondaryControls}>
          <Pressable onPress={cycleSpeed} hitSlop={12} style={styles.iconBtn}>
  <Text style={[styles.speedText, { color: speed !== 1.0 ? theme.colors.primary : theme.colors.textSecondary }]}>
    {speed}x
  </Text>
</Pressable>
          <Pressable onPress={toggleShuffle} hitSlop={12} style={styles.iconBtn}>
            <Ionicons
              name="shuffle"
              size={22}
              color={shuffle ? theme.colors.primary : theme.colors.textSecondary}
            />
          </Pressable>

          <Pressable onPress={toggleRepeat} hitSlop={12} style={styles.iconBtn}>
            <Ionicons
              name="repeat"
              size={22}
              color={repeat !== 'off' ? theme.colors.primary : theme.colors.textSecondary}
            />
            {repeat === 'track' && (
              <Text style={[styles.repeatIndicator, { color: theme.colors.primary }]}>1</Text>
            )}
          </Pressable>
        </View>

        {/* Controles principais */}
        <View style={styles.controls}>
          <Pressable onPress={previous} hitSlop={12} style={styles.ctrlBtn}>
            <Ionicons name="play-skip-back" size={34} color={theme.colors.text} />
          </Pressable>

          <Pressable
            onPress={toggle}
            style={[styles.playBtn, { backgroundColor: theme.colors.primary }, shadows.lg]}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={38} color="#FFF" />
          </Pressable>

          <Pressable onPress={next} hitSlop={12} style={styles.ctrlBtn}>
            <Ionicons name="play-skip-forward" size={34} color={theme.colors.text} />
          </Pressable>
        </View>
      </SafeAreaView>

      <TrackOptionsModal
        visible={optionsOpen}
        onClose={() => setOptionsOpen(false)}
        track={currentTrack}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, paddingHorizontal: spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  coverWrapper: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.xl },
  cover: { width: COVER_SIZE, height: COVER_SIZE, borderRadius: radius.xl },
  meta: { gap: 4, marginBottom: spacing.xl },
  title: { fontSize: 24, fontWeight: '800' },
  artist: { fontSize: 15 },
  progressBlock: { marginBottom: spacing.lg },
  slider: { width: '100%', height: 40 },
  timeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { fontSize: 12 },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginBottom: spacing.md,
  },
  iconBtn: {
    padding: spacing.sm,
    position: 'relative',
  },
  repeatIndicator: {
    position: 'absolute',
    top: 2,
    right: 2,
    fontSize: 10,
    fontWeight: '800',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  ctrlBtn: { padding: spacing.sm },
  playBtn: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedText: {
  fontSize: 14,
  fontWeight: '800',
  letterSpacing: 0.5,
},
});

export default PlayerScreen;