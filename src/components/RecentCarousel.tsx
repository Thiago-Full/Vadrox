// src/components/RecentCarousel.tsx
import React, { FC } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useThemeStore } from '../store/useThemeStore';
import { radius, spacing, shadows } from '../theme/theme';
import type { Track } from '../store/usePlayerStore';

interface RecentCarouselProps {
  items: Track[];
  onItemPress: (item: Track) => void;
  title?: string;
}

const RecentCarousel: FC<RecentCarouselProps> = ({
  items,
  onItemPress,
  title = 'Tocadas Recentemente',
}) => {
  const theme = useThemeStore((s) => s.theme);

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {items.map((album) => (
          <Pressable
            key={album.id}
            style={styles.cardWrapper}
            onPress={() => onItemPress(album)}
          >
            <View style={[styles.card, { backgroundColor: theme.colors.surfaceLight }, shadows.md]}>
              <Image source={{ uri: album.artwork }} style={styles.cover} />
              <View style={styles.overlay} />
              <View style={[styles.playBadge, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="play" size={18} color="#FFF" />
              </View>
            </View>
            <Text numberOfLines={2} style={[styles.cardTitle, { color: theme.colors.text }]}>
              {album.title}
            </Text>
            <Text numberOfLines={1} style={[styles.cardArtist, { color: theme.colors.textSecondary }]}>
              {album.artist}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing.md, marginBottom: spacing.lg },
  title: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  cardWrapper: { width: 150, gap: spacing.sm },
  card: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  cover: { width: '100%', height: '100%' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.18)' },
  playBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 13, fontWeight: '600', lineHeight: 18 },
  cardArtist: { fontSize: 12 },
});

export default RecentCarousel;