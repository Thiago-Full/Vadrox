// src/screens/PlaylistScreen.tsx
import React, { FC, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Image,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import { useThemeStore } from '../store/useThemeStore';
import { Track, usePlayerStore } from '../store/usePlayerStore';
import { usePlaylistStore } from '../store/usePlaylistStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useDownloadStore } from '../store/useDownloadStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { spacing, radius, shadows } from '../theme/theme';
import MusicListItem from '../components/MusicListItem';
import TrackOptionsModal from '../components/ui/TrackOptionsModal';
import EditPlaylistModal from '../components/ui/EditPlaylistModal';
import type { RootStackParamList } from '../types/navigation';

type R = RouteProp<RootStackParamList, 'Playlist'>;

const PlaylistScreen: FC = () => {
  const navigation = useNavigation();
  const route = useRoute<R>();
  const theme = useThemeStore((s) => s.theme);
  const play = usePlayerStore((s) => s.play);
  const playlists = usePlaylistStore((s) => s.playlists);
  const favorites = useFavoritesStore((s) => s.favorites);
  const downloadTracks = useDownloadStore((s) => s.downloadedTracks);
  const history = useHistoryStore((s) => s.history);

  const [optionsTrack, setOptionsTrack] = useState<Track | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const isFavorites = route.params.playlistId === 'favorites';
  const isDownloads = route.params.playlistId === 'downloads';

  const downloadedTracks = downloadTracks;

  const playlist = isFavorites
    ? { id: 'favorites', name: 'Músicas Favoritas', tracks: favorites ?? [], coverUrl: undefined }
    : isDownloads
    ? { id: 'downloads', name: 'Músicas Baixadas', tracks: downloadedTracks, coverUrl: undefined }
    : playlists.find((p) => p.id === route.params.playlistId);

  const tracks = playlist?.tracks ?? [];
  const canEdit = !isFavorites && !isDownloads;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={theme.colors.text} />
          </Pressable>
          <Text numberOfLines={1} style={[styles.title, { color: theme.colors.text }]}>
            {playlist?.name ?? route.params.title}
          </Text>
          {canEdit ? (
            <TouchableOpacity onPress={() => setEditOpen(true)} hitSlop={12}>
              <Ionicons name="ellipsis-horizontal" size={22} color={theme.colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 22 }} />
          )}
        </View>

        <View style={styles.hero}>
          {playlist?.coverUrl ? (
            <Image source={{ uri: playlist.coverUrl }} style={[styles.cover, shadows.lg]} />
          ) : (
            <View
              style={[
                styles.cover,
                styles.coverPlaceholder,
                { backgroundColor: theme.colors.surfaceLight, borderColor: theme.colors.border },
                shadows.lg,
              ]}
            >
              <Ionicons
                name={isFavorites ? 'heart' : isDownloads ? 'cloud-download' : 'musical-notes'}
                size={52}
                color={theme.colors.primary}
              />
            </View>
          )}
          <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
            {tracks.length} {tracks.length === 1 ? 'música' : 'músicas'}
          </Text>
        </View>

        <FlatList
          data={tracks}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <MusicListItem
              track={item}
              onPress={(tr) => play(tr, tracks)}
              onOptions={setOptionsTrack}
            />
          )}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.colors.textTertiary }]}>
              {isFavorites
                ? 'Nenhuma favorita ainda. Toque no ❤️ de uma música.'
                : isDownloads
                ? 'Nenhum download ainda. Toque em Baixar pelos 3 pontinhos.'
                : 'Playlist vazia. Adicione músicas pelos 3 pontinhos.'}
            </Text>
          }
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>

      {optionsTrack && (
        <TrackOptionsModal
          visible={!!optionsTrack}
          onClose={() => setOptionsTrack(null)}
          track={optionsTrack}
        />
      )}

      {canEdit && playlist && (
        <EditPlaylistModal
          visible={editOpen}
          onClose={() => setEditOpen(false)}
          playlistId={playlist.id}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: { fontSize: 18, fontWeight: '800', flex: 1, textAlign: 'center' },
  hero: { alignItems: 'center', paddingBottom: spacing.lg, gap: spacing.md },
  cover: { width: 180, height: 180, borderRadius: radius.xl },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  meta: { fontSize: 13 },
  empty: { textAlign: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.xl },
});

export default PlaylistScreen;