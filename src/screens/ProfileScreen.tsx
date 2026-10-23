// src/screens/ProfileScreen.tsx
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
import { usePlayerStore } from '../store/usePlayerStore';
import { useHistoryStore } from '../store/useHistoryStore';
import { useUserStore } from '../store/useUserStore';
import { spacing, radius, shadows } from '../theme/theme';
import GradientBackground from '../components/ui/GradientBackground';
import MusicListItem from '../components/MusicListItem';
import EditProfileModal from '../components/ui/EditProfileModal';

const ProfileScreen: FC = () => {
  const navigation = useNavigation<any>();
  const theme = useThemeStore((s) => s.theme);
  const play = usePlayerStore((s) => s.play);
  const history = useHistoryStore((s) => s.history);
  const { name, bio, photoUrl } = useUserStore();

  const [editOpen, setEditOpen] = useState(false);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <GradientBackground height={340} colors={theme.colors.gradientHeader} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              hitSlop={12}
            >
              <Ionicons name="menu" size={26} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Perfil</Text>
            <View style={{ width: 26 }} />
          </View>

          <View style={styles.profileBlock}>
            <Image
              source={{ uri: photoUrl }}
              style={[styles.avatar, { borderColor: theme.colors.primary }]}
            />
            <Text style={[styles.name, { color: theme.colors.text }]}>{name}</Text>
            <Text style={[styles.bio, { color: theme.colors.textSecondary }]}>{bio}</Text>

            <TouchableOpacity
              style={[styles.editBtn, { borderColor: theme.colors.primary }]}
              onPress={() => setEditOpen(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={16} color={theme.colors.primary} />
              <Text style={[styles.editBtnText, { color: theme.colors.primary }]}>
                Editar Perfil
              </Text>
            </TouchableOpacity>
          </View>

          {/* Section header com "Ver tudo" */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              Últimas Tocadas
            </Text>
            {history.length > 0 && (
              <TouchableOpacity
                onPress={() => navigation.navigate('History')}
                hitSlop={12}
              >
                <Text style={[styles.seeAll, { color: theme.colors.primary }]}>
                  Ver tudo
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {history.length > 0 ? (
            <View
              style={[
                styles.list,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
              ]}
            >
              {history.slice(0, 10).map((t) => (
                <MusicListItem
                  key={`${t.id}-${t.playedAt ?? 0}`}
                  track={t}
                  onPress={(tr) => play(tr, history)}
                />
              ))}
            </View>
          ) : (
            <Text style={[styles.empty, { color: theme.colors.textTertiary }]}>
              Nada por aqui ainda
            </Text>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      <EditProfileModal visible={editOpen} onClose={() => setEditOpen(false)} />
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
  headerTitle: { fontSize: 22, fontWeight: '800' },
  profileBlock: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    marginBottom: spacing.md,
    ...shadows.lg,
  },
  name: { fontSize: 22, fontWeight: '800' },
  bio: { fontSize: 13, textAlign: 'center', paddingHorizontal: spacing.xl },
  editBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1.5,
  },
  editBtnText: { fontSize: 13, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  seeAll: { fontSize: 13, fontWeight: '700' },
  list: {
    marginHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  empty: {
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
});

export default ProfileScreen;