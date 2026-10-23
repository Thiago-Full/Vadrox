// src/components/MusicListItem.tsx
import React, { FC } from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useThemeStore } from '../store/useThemeStore';
import { usePlayerStore, Track } from '../store/usePlayerStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { radius, spacing } from '../theme/theme';

interface MusicListItemProps {
  track: Track;
  subtitle?: string;
  onPress?: (track: Track) => void;
  onOptions?: (track: Track) => void;
  showFavoriteButton?: boolean;
}

const MusicListItem: FC<MusicListItemProps> = ({
  track,
  subtitle,
  onPress,
  onOptions,
  showFavoriteButton = false,
}) => {
  const theme = useThemeStore((s) => s.theme);
  const play = usePlayerStore((s) => s.play);
  const favorites = useFavoritesStore((s) => s.favorites);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const isFav = favorites.some((t) => t.id === track.id);

  return (
    <Pressable
      onPress={() => (onPress ? onPress(track) : play(track))}
      style={({ pressed }) => [
        styles.container,
        { opacity: pressed ? 0.75 : 1, borderBottomColor: theme.colors.divider },
      ]}
    >
      <Image
        source={{ uri: track.artwork }}
        style={[styles.cover, { backgroundColor: theme.colors.surfaceLight }]}
      />

      <View style={styles.info}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.colors.text }]}>
          {track.title}
        </Text>
        <Text numberOfLines={1} style={[styles.artist, { color: theme.colors.textSecondary }]}>
          {subtitle ?? track.artist}
        </Text>
      </View>

      {showFavoriteButton && (
        <Pressable onPress={() => toggleFavorite(track)} hitSlop={12} style={styles.iconBtn}>
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={22}
            color={isFav ? theme.colors.primary : theme.colors.textSecondary}
          />
        </Pressable>
      )}

      <Pressable onPress={() => onOptions?.(track)} hitSlop={12} style={styles.iconBtn}>
        <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textSecondary} />
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: spacing.md,
  },
  cover: { width: 56, height: 56, borderRadius: radius.md },
  info: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '600' },
  artist: { fontSize: 13 },
  iconBtn: { padding: spacing.sm },
});

export default MusicListItem;