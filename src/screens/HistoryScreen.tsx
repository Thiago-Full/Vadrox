// src/screens/HistoryScreen.tsx
import React, { FC, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DrawerActions, useNavigation } from '@react-navigation/native';

import { useThemeStore } from '../store/useThemeStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { usePlayerStore, Track } from '../store/usePlayerStore';
import MusicListItem from '../components/MusicListItem';
import { spacing } from '../theme/theme';

type Section = { title: string; data: Track[] };

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
};

const groupHistory = (history: Track[]): Section[] => {
  const today = startOfDay(new Date());
  const yesterday = today - 86400000;
  const weekAgo = today - 86400000 * 7;

  const buckets: Record<string, Track[]> = {
    Hoje: [],
    Ontem: [],
    'Esta semana': [],
    'Mais antigo': [],
  };

  history.forEach((t) => {
    const ts = t.playedAt ?? Date.now();
    if (ts >= today) buckets.Hoje.push(t);
    else if (ts >= yesterday) buckets.Ontem.push(t);
    else if (ts >= weekAgo) buckets['Esta semana'].push(t);
    else buckets['Mais antigo'].push(t);
  });

  return Object.entries(buckets)
    .filter(([, data]) => data.length > 0)
    .map(([title, data]) => ({ title, data }));
};

const HistoryScreen: FC = () => {
  const navigation = useNavigation<any>();
  const theme = useThemeStore((s) => s.theme);
  const history = useHistoryStore((s) => s.history);
  const clearHistory = useHistoryStore((s) => s.clearHistory);
  const play = usePlayerStore((s) => s.play);

  const sections = useMemo(() => groupHistory(history), [history]);

  const handlePlay = async (track: Track) => {
    await play(track, history);
    navigation.navigate('Player');
  };

  const handleClear = () => {
    Alert.alert(
      'Limpar histórico',
      'Isso vai apagar todo o histórico de reprodução. Continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => clearHistory(),
        },
      ],
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            hitSlop={12}
          >
            <Ionicons name="menu" size={26} color={theme.colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Histórico
          </Text>
          <Pressable
            onPress={handleClear}
            hitSlop={12}
            disabled={history.length === 0}
          >
            <Ionicons
              name="trash-outline"
              size={22}
              color={
                history.length === 0
                  ? theme.colors.textTertiary
                  : theme.colors.danger
              }
            />
          </Pressable>
        </View>

        {history.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="time-outline"
              size={56}
              color={theme.colors.textTertiary}
            />
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>
              Nada por aqui ainda
            </Text>
            <Text
              style={[styles.emptyText, { color: theme.colors.textSecondary }]}
            >
              As músicas que você ouvir vão aparecer aqui.
            </Text>
          </View>
        ) : (
          <FlatList
            data={sections}
            keyExtractor={(item) => item.title}
            contentContainerStyle={{ paddingBottom: 120 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: section }) => (
              <View>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: theme.colors.textSecondary },
                  ]}
                >
                  {section.title}
                </Text>
                {section.data.map((track) => (
                  <MusicListItem
                    key={`${track.id}-${track.playedAt ?? 0}`}
                    track={track}
                    onPress={() => handlePlay(track)}
                  />
                ))}
              </View>
            )}
          />
        )}
      </SafeAreaView>
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
  headerTitle: { fontSize: 18, fontWeight: '800' },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: spacing.md },
  emptyText: { fontSize: 14, textAlign: 'center' },
});

export default HistoryScreen;