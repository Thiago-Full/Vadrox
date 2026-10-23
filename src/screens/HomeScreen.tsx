// src/screens/HomeScreen.tsx
import React, { FC, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Slider from '@react-native-community/slider';

import { useThemeStore } from '../store/useThemeStore';
import { usePlayerStore } from '../store/usePlayerStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { useRecommendationsStore } from '../store/useRecommendationsStore';
import { useSearchStore } from '../store/useSearchStore';
import { spacing, radius, shadows } from '../theme/theme';
import GradientBackground from '../components/ui/GradientBackground';
import RecentCarousel from '../components/RecentCarousel';
import AiAssistant from '../components/AiAssistant';

// ─── Extrai artista real do track ───
const extractArtist = (track: any): string | null => {
  const channel = (track.artist || '').trim();
  const title = (track.title || '').trim();

  const badChannels = [
    'capturedtracks', 'fortune', 'various artists', 'topic',
    'records', 'music', 'official', 'vevo', 'lyrics', 'sounds',
    'sound experience',
  ];
  const isBadChannel = badChannels.some((b) =>
    channel.toLowerCase().includes(b),
  );

  const separatorMatch = title.match(/^(.+?)\s*[\/\-–]\s*.+$/);
  if (separatorMatch) {
    const guess = separatorMatch[1].trim();
    if (guess.length > 2 && guess.length < 40) return guess;
  }

  if (channel && !isBadChannel) return channel;
  return null;
};

// ─── Definição dos níveis (nome, ícone, descrição) ───
type LevelInfo = {
  label: string;
  icon: string;
  desc: string;
};

const getLevelInfo = (v: number): LevelInfo => {
  if (v <= 20)
    return {
      label: 'Conservador',
      icon: 'shield-checkmark-outline',
      desc: 'Só o que você já ama. Mesmo gênero, mesma vibe.',
    };
  if (v <= 45)
    return {
      label: 'Familiar',
      icon: 'home-outline',
      desc: 'Perto do que você ouve, com uma ou outra novidade.',
    };
  if (v <= 65)
    return {
      label: 'Equilibrado',
      icon: 'git-compare-outline',
      desc: 'Metade conhecido, metade descoberta.',
    };
  if (v <= 85)
    return {
      label: 'Ousado',
      icon: 'flame-outline',
      desc: 'Cruza gêneros, décadas e países. Surpreende.',
    };
  return {
    label: 'Aventureiro',
    icon: 'rocket-outline',
    desc: 'Trago artistas de outros mundos pra você descobrir.',
  };
};

const HomeScreen: FC = () => {
  const navigation = useNavigation();
  const theme = useThemeStore((s) => s.theme);
  const play = usePlayerStore((s) => s.play);
  const history = useHistoryStore((s) => s.history);
  const recentSearches = useSearchStore((s) => s.recentSearches);
  const [search, setSearch] = useState('');

  const recommendedTracks = useRecommendationsStore((s) => s.tracks);
  const fetchRecommendations = useRecommendationsStore((s) => s.fetchRecommendations);
  const loadingRecs = useRecommendationsStore((s) => s.loading);
  const adventureLevel = useRecommendationsStore((s) => s.adventureLevel);
  const setAdventureLevel = useRecommendationsStore((s) => s.setAdventureLevel);

  const [localLevel, setLocalLevel] = useState(adventureLevel);
  const [refreshing, setRefreshing] = useState(false);

  const levelInfo = getLevelInfo(localLevel);

  // ─── Debounce: aplica o nível 1.2s após soltar o slider ───
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localLevel !== adventureLevel) {
        setAdventureLevel(localLevel);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [localLevel]);

  const buildParams = () => {
    const artists = Array.from(
      new Set(history.map(extractArtist).filter((a): a is string => !!a)),
    ).slice(0, 2);
    const genres = recentSearches.slice(0, 1);
    return { artists, genres };
  };

  const handleRefresh = async () => {
    if (refreshing || loadingRecs) return;
    setRefreshing(true);
    const { artists, genres } = buildParams();
    console.log('[HOME] refresh manual | artistas:', artists, '| nível:', localLevel);
    try {
      await useRecommendationsStore.getState().forceRefresh(artists, genres);
    } finally {
      setTimeout(() => setRefreshing(false), 400);
    }
  };

  // ─── Fetch inicial + quando histórico OU nível mudam ───
  useEffect(() => {
    const { artists, genres } = buildParams();

    if (history.length === 0) {
      console.log('[HOME] sem histórico, fallback genérico');
      fetchRecommendations([], genres);
      return;
    }

    console.log('[HOME] artistas extraídos:', artists, '| gêneros:', genres);
    fetchRecommendations(artists, genres);
  }, [history.length, adventureLevel]);

  const busy = loadingRecs || refreshing;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <GradientBackground height={320} colors={theme.colors.gradientHeader} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              hitSlop={12}
            >
              <Ionicons name="menu" size={26} color={theme.colors.text} />
            </TouchableOpacity>

            <Text style={[styles.logo, { color: theme.colors.text }]}>Vadrox</Text>

            <View style={{ width: 26 }} />
          </View>

          <View
            style={[
              styles.searchBar,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => {
                if (search.trim()) {
                  (navigation as any).navigate('Search', {
                    initialQuery: search.trim(),
                    _ts: Date.now(),
                  });
                  setSearch('');
                }
              }}
              returnKeyType="search"
              placeholder="Buscar músicas, artistas..."
              placeholderTextColor={theme.colors.textTertiary}
              style={[styles.searchInput, { color: theme.colors.text }]}
            />
            <AiAssistant variant="icon" size={20} />
          </View>

          {history.length > 0 ? (
            <RecentCarousel
              items={history.slice(0, 10)}
              onItemPress={(t) => play(t, history)}
            />
          ) : (
            <View style={styles.emptyBlock}>
              <Ionicons
                name="musical-notes-outline"
                size={40}
                color={theme.colors.textTertiary}
              />
              <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
                Toque uma música pra começar
              </Text>
            </View>
          )}

          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Atalhos Rápidos
          </Text>

          <View style={styles.grid}>
            <TouchableOpacity
              style={[
                styles.quickCard,
                { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border },
              ]}
              onPress={() =>
                (navigation as any).navigate('Playlist', {
                  playlistId: 'favorites',
                  title: 'Músicas Favoritas',
                })
              }
              activeOpacity={0.7}
            >
              <Ionicons name="heart" size={26} color={theme.colors.primary} />
              <Text style={[styles.quickText, { color: theme.colors.text }]}>
                Favoritos
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.quickCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
              onPress={() =>
                (navigation as any).navigate('Playlist', {
                  playlistId: 'downloads',
                  title: 'Músicas Baixadas',
                })
              }
              activeOpacity={0.7}
            >
              <Ionicons name="cloud-download" size={26} color={theme.colors.primary} />
              <Text style={[styles.quickText, { color: theme.colors.text }]}>
                Downloads
              </Text>
            </TouchableOpacity>
          </View>

          {/* ─── Recomendadas ─── */}
          <View style={{ marginTop: spacing.xl }}>
            <View style={styles.recHeader}>
              <Text style={[styles.sectionTitle, styles.recHeaderTitle, { color: theme.colors.text }]}>
                Recomendadas pra você
              </Text>
              <TouchableOpacity
                onPress={handleRefresh}
                hitSlop={10}
                disabled={busy}
                style={styles.refreshBtn}
              >
                {busy ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Ionicons name="refresh" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            </View>

            {/* 🎚️ Card do Aventureiro */}
            <View
              style={[
                styles.adventureCard,
                {
                  backgroundColor: theme.colors.card,
                  borderColor: theme.colors.border,
                },
              ]}
            >
              <View style={styles.adventureHeader}>
                <Ionicons
                  name={levelInfo.icon as any}
                  size={18}
                  color={theme.colors.primary}
                />
                <Text style={[styles.adventureLevel, { color: theme.colors.primary }]}>
                  {levelInfo.label}
                </Text>
                <Text
                  style={[styles.adventurePct, { color: theme.colors.textTertiary }]}
                >
                  {Math.round(localLevel)}%
                </Text>
              </View>

              <Text
                style={[styles.adventureDesc, { color: theme.colors.textSecondary }]}
                numberOfLines={2}
              >
                {levelInfo.desc}
              </Text>

              <Slider
                style={styles.adventureSlider}
                minimumValue={0}
                maximumValue={100}
                step={25}
                value={localLevel}
                onValueChange={setLocalLevel}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
                thumbTintColor={theme.colors.primary}
              />

              <View style={styles.sliderLabels}>
                <Text
                  style={[styles.sliderLabel, { color: theme.colors.textTertiary }]}
                >
                  Conservador
                </Text>
                <Text
                  style={[styles.sliderLabel, { color: theme.colors.textTertiary }]}
                >
                  Aventureiro
                </Text>
              </View>
            </View>

            {loadingRecs && recommendedTracks.length === 0 ? (
              <ActivityIndicator
                size="small"
                color={theme.colors.primary}
                style={{ marginTop: spacing.md }}
              />
            ) : recommendedTracks.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: spacing.lg,
                  gap: spacing.md,
                  opacity: busy ? 0.5 : 1,
                }}
              >
                {recommendedTracks.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={styles.recCard}
                    onPress={() => play(t, recommendedTracks)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: t.artwork }}
                      style={[
                        styles.recArt,
                        { backgroundColor: theme.colors.surfaceLight },
                      ]}
                    />
                    <Text
                      numberOfLines={1}
                      style={[styles.recTitle, { color: theme.colors.text }]}
                    >
                      {t.title}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[styles.recArtist, { color: theme.colors.textSecondary }]}
                    >
                      {t.artist}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            ) : (
              <Text style={[styles.recEmpty, { color: theme.colors.textTertiary }]}>
                Nada ainda. Ouve umas músicas que eu recomendo depois.
              </Text>
            )}
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  scrollContent: { paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
  },
  logo: { fontSize: 22, fontWeight: '800', letterSpacing: 2 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  quickCard: {
    flex: 1,
    aspectRatio: 1.4,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...shadows.sm,
  },
  quickText: { fontSize: 14, fontWeight: '600' },
  emptyBlock: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.md,
  },
  emptyText: { fontSize: 14 },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recHeaderTitle: {
    marginBottom: 0,
  },
  refreshBtn: {
    paddingHorizontal: spacing.lg,
    minWidth: 40,
    alignItems: 'flex-end',
  },

  // ─── Card do Aventureiro ───
  adventureCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    ...shadows.sm,
  },
  adventureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  adventureLevel: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    flex: 1,
  },
  adventurePct: {
    fontSize: 12,
    fontWeight: '600',
  },
  adventureDesc: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  adventureSlider: {
    width: '100%',
    height: 32,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginTop: -4,
  },
  sliderLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  recCard: { width: 130, gap: 6 },
  recArt: { width: 130, height: 130, borderRadius: radius.md },
  recTitle: { fontSize: 13, fontWeight: '600' },
  recArtist: { fontSize: 11 },
  recEmpty: {
    fontSize: 13,
    paddingHorizontal: spacing.lg,
    fontStyle: 'italic',
    marginTop: spacing.md,
  },
});

export default HomeScreen;