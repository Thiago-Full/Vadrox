// src/components/ui/EditPlaylistModal.tsx
import React, { FC, useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

import { useThemeStore } from '../../store/useThemeStore';
import { usePlaylistStore } from '../../store/usePlaylistStore';
import { spacing, radius, shadows } from '../../theme/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  playlistId: string;
}

const EditPlaylistModal: FC<Props> = ({ visible, onClose, playlistId }) => {
  const theme = useThemeStore((s) => s.theme);
  const playlists = usePlaylistStore((s) => s.playlists);
  const setCoverStore = usePlaylistStore((s) => s.setCover);
  const renamePlaylist = usePlaylistStore((s) => s.renamePlaylist);
  const deletePlaylist = usePlaylistStore((s) => s.deletePlaylist);

  const playlist = playlists.find((p) => p.id === playlistId);

  const [name, setName] = useState('');
  const [cover, setCover] = useState('');

  useEffect(() => {
    if (visible && playlist) {
      setName(playlist.name);
      setCover(playlist.coverUrl ?? '');
    }
  }, [visible, playlist]);

  if (!playlist) return null;

  const handlePickImage = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        selectionLimit: 1,
      });
      if (result.didCancel) return;
      if (result.errorCode) {
        Alert.alert('Erro', result.errorMessage ?? 'Não foi possível abrir a galeria');
        return;
      }
      const uri = result.assets?.[0]?.uri;
      if (uri) setCover(uri);
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Falha ao escolher imagem');
    }
  };

  const handleSave = () => {
    if (name.trim()) renamePlaylist(playlistId, name.trim());
    if (cover.trim()) setCoverStore(playlistId, cover.trim());
    onClose();
  };

  const handleDelete = () => {
    Alert.alert('Deletar playlist', `Remover "${playlist.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Deletar',
        style: 'destructive',
        onPress: () => {
          deletePlaylist(playlistId);
          onClose();
        },
      },
    ]);
  };

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.title, { color: theme.colors.text }]}>Editar Playlist</Text>

          <TouchableOpacity onPress={handlePickImage} style={styles.coverRow}>
            {cover ? (
              <Image source={{ uri: cover }} style={styles.cover} />
            ) : (
              <View
                style={[
                  styles.cover,
                  styles.coverPlaceholder,
                  {
                    backgroundColor: theme.colors.surfaceLight,
                    borderColor: theme.colors.border,
                  },
                ]}
              >
                <Ionicons name="camera" size={34} color={theme.colors.primary} />
                <Text style={[styles.coverHint, { color: theme.colors.textSecondary }]}>
                  Escolher capa
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nome</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Nome da playlist"
            placeholderTextColor={theme.colors.textTertiary}
            style={[
              styles.input,
              {
                color: theme.colors.text,
                borderColor: theme.colors.border,
                backgroundColor: theme.colors.surface,
              },
            ]}
          />

          <View style={styles.actions}>
            <Pressable
              style={[styles.btn, { borderColor: theme.colors.danger }]}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={18} color={theme.colors.danger} />
            </Pressable>
            <Pressable
              style={[styles.btn, styles.btnPrimary, { backgroundColor: theme.colors.primary }]}
              onPress={handleSave}
            >
              <Ionicons name="checkmark" size={18} color="#FFF" />
              <Text style={styles.btnPrimaryText}>Salvar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    ...shadows.lg,
  },
  handle: { width: 44, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.md },
  title: { fontSize: 18, fontWeight: '800', marginBottom: spacing.md },
  coverRow: { alignItems: 'center', marginBottom: spacing.md },
  cover: { width: 140, height: 140, borderRadius: radius.lg },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  coverHint: { fontSize: 12 },
  label: { fontSize: 12, fontWeight: '600', marginTop: spacing.sm, marginBottom: 6 },
  input: {
    height: 46,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actions: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  btn: {
    height: 46,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
  },
  btnPrimary: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 0,
  },
  btnPrimaryText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default EditPlaylistModal;