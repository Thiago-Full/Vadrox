// src/screens/BibliotecaScreen.tsx
import React, { FC, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DrawerActions, useNavigation } from '@react-navigation/native';

import { useThemeStore } from '../store/useThemeStore';
import { usePlaylistStore } from '../store/usePlaylistStore';
import { useFavoritesStore } from '../store/useFavoritesStore';
import { useDownloadStore } from '../store/useDownloadStore';
import { useAiSuggestionsStore } from '../store/useAiSuggestionsStore';
import { spacing, radius, shadows } from '../theme/theme';
import GradientBackground from '../components/ui/GradientBackground';
import AiAssistant from '../components/AiAssistant';
import CreatePlaylistModal from '../components/ui/CreatePlaylistModal';

const BibliotecaScreen: FC = () => {
  const navigation = useNavigation<any>();
  const theme = useThemeStore((s) => s.theme);
  const playlists = usePlaylistStore((s) => s.playlists);
  const favorites = useFavoritesStore((s) => s.favorites);
  const downloads = useDownloadStore((s) => s.downloads);
  const suggestions = useAiSuggestionsStore((s) => s.suggestions);
  const [createOpen, setCreateOpen] = useState(false);
  const downloadCount = Object.keys(downloads).length;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <GradientBackground height={260} colors={theme.colors.gradientHeader} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              hitSlop={12}
            >
              <Ionicons name="menu" size={26} color={theme.colors.text} />
            </TouchableOpacity>

            <Text style={[styles.title, { color: theme.colors.text }]}>Biblioteca</Text>

            <View style={styles.headerRight}>
              <TouchableOpacity
                onPress={() => navigation.navigate('MainTabs', { screen: 'Search' })}
                hitSlop={12}
              >
                <Ionicons name="search" size={22} color={theme.colors.text} />
              </TouchableOpacity>
              <AiAssistant variant="icon" size={22} />
            </View>
          </View>

          <View style={styles.foldersRow}>
            <TouchableOpacity
              style={[
                styles.folderCard,
                { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border },
              ]}
              onPress={() =>
                navigation.navigate('Playlist', {
                  playlistId: 'downloads',
                  title: 'Músicas Baixadas',
                })
              }
            >
              <Ionicons name="cloud-download" size={28} color={theme.colors.primary} />
              <Text style={[styles.folderTitle, { color: theme.colors.text }]}>
                Baixadas
              </Text>
              <Text style={[styles.folderSub, { color: theme.colors.textSecondary }]}>
                {downloadCount} {downloadCount === 1 ? 'faixa' : 'faixas'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.folderCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
              onPress={() =>
                navigation.navigate('Playlist', {
                  playlistId: 'favorites',
                  title: 'Músicas Favoritas',
                })
              }
            >
              <Ionicons name="heart" size={28} color={theme.colors.primary} />
              <Text style={[styles.folderTitle, { color: theme.colors.text }]}>
                Favoritas
              </Text>
              <Text style={[styles.folderSub, { color: theme.colors.textSecondary }]}>
                {favorites.length} {favorites.length === 1 ? 'faixa' : 'faixas'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.folderCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
              onPress={() => navigation.navigate('AiSuggestions')}
            >
              <Ionicons name="sparkles" size={28} color={theme.colors.primary} />
              <Text style={[styles.folderTitle, { color: theme.colors.text }]}>
                Sugestões IA
              </Text>
              <Text style={[styles.folderSub, { color: theme.colors.textSecondary }]}>
                {suggestions.length} {suggestions.length === 1 ? 'faixa' : 'faixas'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Suas Playlists
            </Text>
            <TouchableOpacity onPress={() => setCreateOpen(true)} hitSlop={12}>
              <Ionicons name="add-circle" size={26} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>

          {playlists.length === 0 ? (
            <View style={styles.emptyBlock}>
              <Ionicons
                name="musical-notes-outline"
                size={40}
                color={theme.colors.textTertiary}
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Nenhuma playlist ainda
              </Text>
              <TouchableOpacity
                style={[styles.emptyBtn, { backgroundColor: theme.colors.primary }]}
                onPress={() => setCreateOpen(true)}
              >
                <Ionicons name="add" size={18} color="#FFF" />
                <Text style={styles.emptyBtnText}>Criar Playlist</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.playlistsGrid}>
              {playlists.map((pl) => (
                <TouchableOpacity
                  key={pl.id}
                  style={styles.playlistItem}
                  onPress={() =>
                    navigation.navigate('Playlist', { playlistId: pl.id, title: pl.name })
                  }
                >
                  {pl.coverUrl ? (
                    <Image source={{ uri: pl.coverUrl }} style={styles.playlistCover} />
                  ) : (
                    <View
                      style={[
                        styles.playlistCover,
                        styles.playlistCoverPlaceholder,
                        {
                          backgroundColor: theme.colors.surfaceLight,
                          borderColor: theme.colors.border,
                        },
                        shadows.sm,
                      ]}
                    >
                      <Ionicons name="musical-notes" size={30} color={theme.colors.primary} />
                    </View>
                  )}
                  <Text
                    numberOfLines={1}
                    style={[styles.playlistName, { color: theme.colors.text }]}
                  >
                    {pl.name}
                  </Text>
                  <Text
                    style={[styles.playlistCount, { color: theme.colors.textSecondary }]}
                  >
                    {pl.tracks.length} {pl.tracks.length === 1 ? 'música' : 'músicas'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      <CreatePlaylistModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scroll: { paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  title: { fontSize: 22, fontWeight: '800' },
  foldersRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  folderCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    ...shadows.sm,
  },
  folderTitle: { fontSize: 13, fontWeight: '700' },
  folderSub: { fontSize: 11 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  playlistsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  playlistItem: { width: '30%', gap: 6 },
  playlistCover: { width: '100%', aspectRatio: 1, borderRadius: radius.md },
  playlistCoverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  playlistName: { fontSize: 13, fontWeight: '600' },
  playlistCount: { fontSize: 11 },
  emptyBlock: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.md },
  emptyText: { fontSize: 14 },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  emptyBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});

export default BibliotecaScreen;