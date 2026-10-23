// src/screens/SearchScreen.tsx
import React, { FC, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRoute } from '@react-navigation/native';

import { useThemeStore } from '../store/useThemeStore';
import { Track, usePlayerStore } from '../store/usePlayerStore';
import { useSearchStore } from '../store/useSearchStore';
import { spacing, radius } from '../theme/theme';
import GradientBackground from '../components/ui/GradientBackground';
import AiAssistant from '../components/AiAssistant';
import MusicListItem from '../components/MusicListItem';
import TrackOptionsModal from '../components/ui/TrackOptionsModal';
import { VadroxAPI } from '../services/api';

const SearchScreen: FC = () => {
  const theme = useThemeStore((s) => s.theme);
  const play = usePlayerStore((s) => s.play);
  const route = useRoute<any>();

  const recentSearches = useSearchStore((s) => s.recentSearches);
  const addRecent = useSearchStore((s) => s.addRecent);
  const clearRecent = useSearchStore((s) => s.clearRecent);

  const [query, setQuery] = useState('');
  const [optionsTrack, setOptionsTrack] = useState<Track | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<any>(null);

  // Busca automática com debounce
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();

    // Query vazia: limpa TUDO
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    // Aguarda 1.2s após parar de digitar (evita lixo de digitação parcial)
    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        const tracks = await VadroxAPI.search(trimmed);
        setResults(tracks);
        // Só salva nos recentes se a busca trouxe resultado E tem > 2 chars
        if (tracks.length > 0 && trimmed.length >= 3) {
          addRecent(trimmed);
        }
      } catch (e) {
        console.error('Erro na busca:', e);
      } finally {
        setLoading(false);
      }
    }, 1200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Trigger quando vem da Home
  useEffect(() => {
    const initialQuery = route.params?.initialQuery;
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [route.params?._ts]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    Keyboard.dismiss();
  };

  const showResults = query.trim().length > 0;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <GradientBackground height={260} colors={theme.colors.gradientHeader} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          <Ionicons name="search" size={18} color={theme.colors.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            placeholder="O que você quer ouvir?"
            placeholderTextColor={theme.colors.textTertiary}
            style={[styles.input, { color: theme.colors.text }]}
            autoFocus
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} hitSlop={10}>
              <Ionicons name="close-circle" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
          <AiAssistant variant="icon" size={20} />
        </View>

        {/* Sugestões — só quando query vazia */}
        {!showResults && (
          <View style={styles.suggestionsBlock}>
            <Text style={[styles.resultsLabel, { color: theme.colors.textSecondary }]}>
              Sugestões
            </Text>
            <View style={styles.suggestionsRow}>
              {['Anos 2000', 'Funk', 'Rock', 'Lo-fi', 'Sertanejo', 'MPB', 'Trap', 'Jazz'].map(
                (s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.suggestionChip,
                      {
                        backgroundColor: theme.colors.primarySoft,
                        borderColor: theme.colors.primary,
                      },
                    ]}
                    onPress={() => setQuery(s)}
                  >
                    <Text style={[styles.suggestionText, { color: theme.colors.primary }]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ),
              )}
            </View>
          </View>
        )}

        {/* Pesquisas recentes — só quando query vazia */}
        {!showResults && recentSearches.length > 0 && (
          <View style={styles.recentBlock}>
            <View style={styles.recentHeader}>
              <Text style={[styles.resultsLabel, { color: theme.colors.textSecondary }]}>
                Pesquisas Recentes
              </Text>
              <TouchableOpacity onPress={clearRecent} hitSlop={10}>
                <Text style={[styles.clearText, { color: theme.colors.textSecondary }]}>
                  Limpar
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.recentChips}>
              {recentSearches.map((q) => (
                <TouchableOpacity
                  key={q}
                  style={[
                    styles.recentChip,
                    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                  ]}
                  onPress={() => setQuery(q)}
                >
                  <Ionicons name="time-outline" size={14} color={theme.colors.textSecondary} />
                  <Text style={[styles.recentChipText, { color: theme.colors.text }]}>{q}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Resultados — só quando query tem conteúdo */}
        {showResults && (
          <>
            <Text style={[styles.resultsLabel, { color: theme.colors.textSecondary }]}>
              {results.length > 0 ? 'Resultados' : loading ? 'Buscando...' : 'Nada encontrado'}
            </Text>

            {loading ? (
              <ActivityIndicator
                size="large"
                color={theme.colors.primary}
                style={{ marginTop: spacing.xl }}
              />
            ) : (
              <FlatList
                data={results}
                keyExtractor={(t) => t.id}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                  <MusicListItem
                    track={item}
                    showFavoriteButton
                    onPress={async (tr) => {
                      try {
                        const startIndex = results.findIndex((r) => r.id === tr.id);
                        const slice = results.slice(startIndex, startIndex + 3);

                        const withUrls = await Promise.all(
                          slice.map(async (r) => {
                            const url = await VadroxAPI.getAudioUrl(r.id);
                            return url ? { ...r, url } : null;
                          }),
                        );
                        const valid = withUrls.filter((t): t is any => t !== null);
                        if (valid.length > 0) {
                          play(valid[0], valid);
                        }
                      } catch (e) {
                        console.error(e);
                      }
                    }}
                    onOptions={setOptionsTrack}
                  />
                )}
                ListEmptyComponent={
                  <Text style={[styles.empty, { color: theme.colors.textTertiary }]}>
                    Nada por aqui. Tenta outro nome.
                  </Text>
                }
                contentContainerStyle={{ paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
              />
            )}
          </>
        )}
      </SafeAreaView>

      {optionsTrack && (
        <TrackOptionsModal
          visible={!!optionsTrack}
          onClose={() => setOptionsTrack(null)}
          track={optionsTrack}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  input: { flex: 1, fontSize: 15, padding: 0 },
  resultsLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  empty: { textAlign: 'center', marginTop: spacing.xl },
  suggestionsBlock: { marginTop: spacing.md, marginBottom: spacing.md },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  suggestionChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  suggestionText: { fontSize: 13, fontWeight: '700' },
  recentBlock: { marginTop: spacing.md, marginBottom: spacing.md },
  recentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  },
  clearText: { fontSize: 12, fontWeight: '600' },
  recentChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  recentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  recentChipText: { fontSize: 13 },
});

export default SearchScreen;