// src/screens/AiSuggestionsScreen.tsx
import React, { FC, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { useThemeStore } from '../store/useThemeStore';
import { usePlayerStore, Track } from '../store/usePlayerStore';
import { useAiSuggestionsStore } from '../store/useAiSuggestionsStore';
import { spacing, radius, shadows } from '../theme/theme';
import MusicListItem from '../components/MusicListItem';
import TrackOptionsModal from '../components/ui/TrackOptionsModal';

const AiSuggestionsScreen: FC = () => {
  const navigation = useNavigation();
  const theme = useThemeStore((s) => s.theme);
  const play = usePlayerStore((s) => s.play);
  const suggestions = useAiSuggestionsStore((s) => s.suggestions);
  const clear = useAiSuggestionsStore((s) => s.clear);

  const [optionsTrack, setOptionsTrack] = useState<Track | null>(null);

  const handleClear = () => {
    Alert.alert(
      'Limpar sugestões',
      'Apagar todas as músicas sugeridas pela IA?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => clear() },
      ],
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={theme.colors.text} />
          </Pressable>
          <Text numberOfLines={1} style={[styles.title, { color: theme.colors.text }]}>
            Sugestões da IA
          </Text>
          <TouchableOpacity onPress={handleClear} hitSlop={12}>
            <Ionicons name="trash-outline" size={22} color={theme.colors.danger} />
          </TouchableOpacity>
        </View>

        <View style={styles.hero}>
          <View
            style={[
              styles.cover,
              styles.coverPlaceholder,
              { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border },
              shadows.lg,
            ]}
          >
            <Ionicons name="sparkles" size={52} color={theme.colors.primary} />
          </View>
          <Text style={[styles.meta, { color: theme.colors.textSecondary }]}>
            {suggestions.length} {suggestions.length === 1 ? 'sugestão' : 'sugestões'}
          </Text>
        </View>

        <FlatList
          data={suggestions}
          keyExtractor={(t) => t.id}
          renderItem={({ item }) => (
            <MusicListItem
              track={item}
              onPress={(tr) => play(tr, suggestions)}
              onOptions={setOptionsTrack}
            />
          )}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.colors.textTertiary }]}>
              Nada por aqui ainda. Peça uma recomendação no chat da IA.
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
  cover: {
    width: 160,
    height: 160,
    borderRadius: radius.xl,
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  meta: { fontSize: 13 },
  empty: { textAlign: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.xl },
});

export default AiSuggestionsScreen;