// src/screens/ConfigScreen.tsx
import React, { FC, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { launchImageLibrary } from 'react-native-image-picker';

import { useThemeStore } from '../store/useThemeStore';
import { useChatbotStore } from '../store/useChatbotStore';
import { useChatStore } from '../store/useChatStore';
import { THEME_PRESETS, spacing, radius } from '../theme/theme';
import Accordion from '../components/ui/Accordion';
import DevPanel from '../components/ui/DevPanel';
import ColorPickerModal from '../components/ui/ColorPickerModal';
import ThemeCard from '../components/ui/ThemeCard';

const ConfigScreen: FC = () => {
  const navigation = useNavigation();
  const theme = useThemeStore((s) => s.theme);
  const { mode, setMode, presetId, setPreset } = useThemeStore();
  const { name, photoUrl, bubbleColor, setProfile } = useChatbotStore();
  const clearAllChats = useChatStore((s) => s.clearAll);
  const totalChats = useChatStore((s) => s.conversations.length);

  const [colorOpen, setColorOpen] = useState(false);

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
      if (uri) setProfile({ photoUrl: uri });
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Falha ao escolher imagem');
    }
  };

  const handleClearAllChats = () => {
    Alert.alert(
      'Apagar todas as conversas',
      `Você tem ${totalChats} conversa(s). Isso vai apagar TUDO. As sugestões de IA continuam salvas.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Apagar tudo',
          style: 'destructive',
          onPress: () => {
            clearAllChats();
            Alert.alert('Feito', 'Todas as conversas foram apagadas.');
          },
        },
      ],
    );
  };

  const handleSelectTheme = (id: string) => {
    setPreset(id);
    const preset = THEME_PRESETS.find((p) => p.id === id);
    if (preset) {
      setProfile({ bubbleColor: preset.bubbleColor });
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.colors.text }]}>Configurações</Text>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxl }}>
          <Accordion title="Aparência" icon="moon" defaultOpen>
            <View style={styles.rowBetween}>
              <Text style={[styles.rowLabel, { color: theme.colors.text }]}>Modo Escuro</Text>
              <Switch
                value={mode === 'dark'}
                onValueChange={(v) => setMode(v ? 'dark' : 'light')}
                trackColor={{ true: theme.colors.primary, false: theme.colors.border }}
                thumbColor="#FFF"
              />
            </View>
          </Accordion>

          <Accordion title="Temas" icon="color-palette">
            <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
              Escolha um tema completo — cores, gradiente e balão
            </Text>
            <View style={styles.themeGrid}>
              {THEME_PRESETS.map((p) => (
                <ThemeCard
                  key={p.id}
                  preset={p}
                  isActive={presetId === p.id}
                  onPress={() => handleSelectTheme(p.id)}
                />
              ))}
            </View>
          </Accordion>

          <Accordion title="Chat Edit (IA)" icon="chatbubble-ellipses">
            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Nome da IA
            </Text>
            <TextInput
              value={name}
              onChangeText={(v) => setProfile({ name: v })}
              placeholder="Ex: Sérgio"
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

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Foto da IA
            </Text>
            <TouchableOpacity onPress={handlePickImage} style={styles.photoRow}>
              <Image
                source={{ uri: photoUrl }}
                style={[styles.photoPreview, { borderColor: theme.colors.border }]}
              />
              <View
                style={[
                  styles.photoBtn,
                  { backgroundColor: theme.colors.primarySoft, borderColor: theme.colors.border },
                ]}
              >
                <Ionicons name="image" size={18} color={theme.colors.primary} />
                <Text style={[styles.photoBtnText, { color: theme.colors.primary }]}>
                  Escolher da galeria
                </Text>
              </View>
            </TouchableOpacity>

            <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
              Cor dos Balões
            </Text>
            <TouchableOpacity
              onPress={() => setColorOpen(true)}
              style={[
                styles.colorRow,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <View style={[styles.colorPreview, { backgroundColor: bubbleColor }]} />
              <Text style={[styles.colorHex, { color: theme.colors.text }]}>
                {bubbleColor.toUpperCase()}
              </Text>
              <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleClearAllChats}
              style={[styles.dangerBtn, { borderColor: theme.colors.danger }]}
            >
              <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
              <Text style={[styles.dangerBtnText, { color: theme.colors.danger }]}>
                Apagar todas as conversas
              </Text>
            </TouchableOpacity>
          </Accordion>

          <Accordion title="Painel Dev" icon="construct">
            <DevPanel />
          </Accordion>
        </ScrollView>
      </SafeAreaView>

      <ColorPickerModal
        visible={colorOpen}
        initialColor={bubbleColor}
        onClose={() => setColorOpen(false)}
        onSave={(hex) => setProfile({ bubbleColor: hex })}
      />
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
  title: { fontSize: 18, fontWeight: '800' },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowLabel: { fontSize: 14, fontWeight: '500' },
  hint: { fontSize: 12, marginBottom: spacing.md },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  label: { fontSize: 12, fontWeight: '600', marginTop: spacing.sm, marginBottom: 6 },
  input: {
    height: 42,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  photoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  photoPreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
  },
  photoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  photoBtnText: { fontSize: 13, fontWeight: '700' },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    height: 52,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: spacing.sm,
  },
  colorPreview: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorHex: { flex: 1, fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  dangerBtn: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 46,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  dangerBtnText: { fontSize: 14, fontWeight: '700' },
});

export default ConfigScreen;