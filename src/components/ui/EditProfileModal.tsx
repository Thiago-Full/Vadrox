// src/components/ui/EditProfileModal.tsx
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
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

import { useThemeStore } from '../../store/useThemeStore';
import { useUserStore } from '../../store/useUserStore';
import { spacing, radius } from '../../theme/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
}

const EditProfileModal: FC<Props> = ({ visible, onClose }) => {
  const theme = useThemeStore((s) => s.theme);
  const { name, bio, photoUrl, setProfile } = useUserStore();

  const [localName, setLocalName] = useState(name);
  const [localBio, setLocalBio] = useState(bio);
  const [localPhoto, setLocalPhoto] = useState(photoUrl);

  useEffect(() => {
    if (visible) {
      setLocalName(name);
      setLocalBio(bio);
      setLocalPhoto(photoUrl);
    }
  }, [visible, name, bio, photoUrl]);

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
      if (uri) setLocalPhoto(uri);
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Falha ao escolher imagem');
    }
  };

  const handleSave = () => {
    setProfile({
      name: localName.trim() || name,
      bio: localBio.trim(),
      photoUrl: localPhoto.trim() || photoUrl,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          ]}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />

          <View style={styles.titleRow}>
            <Ionicons name="person-circle" size={22} color={theme.colors.primary} />
            <Text style={[styles.title, { color: theme.colors.text }]}>Editar Perfil</Text>
          </View>

          <ScrollView keyboardShouldPersistTaps="always" showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={handlePickImage} style={styles.avatarRow}>
              <Image
                source={{ uri: localPhoto }}
                style={[styles.avatar, { borderColor: theme.colors.primary }]}
              />
              <View style={[styles.cameraBadge, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="camera" size={14} color="#FFF" />
              </View>
            </TouchableOpacity>

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Nome</Text>
            <TextInput
              value={localName}
              onChangeText={setLocalName}
              placeholder="Seu nome"
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

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>Bio</Text>
            <TextInput
              value={localBio}
              onChangeText={setLocalBio}
              multiline
              placeholder="Fale sobre você"
              placeholderTextColor={theme.colors.textTertiary}
              style={[
                styles.input,
                styles.textarea,
                {
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                  backgroundColor: theme.colors.surface,
                },
              ]}
            />
          </ScrollView>

          <Pressable
            style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleSave}
          >
            <Ionicons name="checkmark" size={20} color="#FFF" />
            <Text style={styles.saveText}>Salvar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    maxHeight: '85%',
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  title: { fontSize: 18, fontWeight: '800' },
  avatarRow: { alignItems: 'center', marginBottom: spacing.md },
  avatar: { width: 96, height: 96, borderRadius: 48, borderWidth: 3 },
  cameraBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 12, fontWeight: '600', marginTop: spacing.sm, marginBottom: 6 },
  input: {
    minHeight: 46,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 48,
    borderRadius: radius.pill,
  },
  saveText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default EditProfileModal;