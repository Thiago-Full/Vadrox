// src/components/ui/CreatePlaylistModal.tsx
import React, { FC, useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useThemeStore } from '../../store/useThemeStore';
import { usePlaylistStore } from '../../store/usePlaylistStore';
import { spacing, radius, shadows } from '../../theme/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated?: (playlistId: string) => void;
}

const CreatePlaylistModal: FC<Props> = ({ visible, onClose, onCreated }) => {
  const theme = useThemeStore((s) => s.theme);
  const createPlaylist = usePlaylistStore((s) => s.createPlaylist);
  const [name, setName] = useState('');

  const confirm = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = createPlaylist(trimmed);
    setName('');
    onCreated?.(id);
    onClose();
  };

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.headerRow}>
            <Ionicons name="musical-notes" size={22} color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.text }]}>Nova Playlist</Text>
          </View>

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
            autoFocus
          />

          <View style={styles.actions}>
            <Pressable style={[styles.btn, { borderColor: theme.colors.border }]} onPress={onClose}>
              <Text style={[styles.btnText, { color: theme.colors.text }]}>Cancelar</Text>
            </Pressable>
            <Pressable
              style={[styles.btn, { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }]}
              onPress={confirm}
            >
              <Text style={[styles.btnText, { color: '#FFF' }]}>Criar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    width: '100%',
    borderRadius: radius.xl,
    padding: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.lg,
    ...shadows.lg,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { fontSize: 18, fontWeight: '800' },
  input: {
    height: 48,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actions: { flexDirection: 'row', gap: spacing.md },
  btn: {
    flex: 1,
    height: 46,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnText: { fontSize: 14, fontWeight: '700' },
});

export default CreatePlaylistModal;