// src/components/ui/ColorPickerModal.tsx
import React, { FC, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ColorPicker, {
  Panel1,
  HueSlider,
  Preview,
} from 'reanimated-color-picker';

import { useThemeStore } from '../../store/useThemeStore';
import { spacing, radius, shadows } from '../../theme/theme';

interface Props {
  visible: boolean;
  initialColor: string;
  onClose: () => void;
  onSave: (hex: string) => void;
}

const ColorPickerModal: FC<Props> = ({ visible, initialColor, onClose, onSave }) => {
  const theme = useThemeStore((s) => s.theme);
  const [picked, setPicked] = useState(initialColor);

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Escolher cor
          </Text>

          <View style={styles.pickerWrapper}>
            <ColorPicker
              value={initialColor}
              onCompleteJS={(color: any) => setPicked(color.hex)}
              style={{ width: '100%', gap: 20 }}
            >
              <Preview style={{ height: 50, borderRadius: 12 }} />
              <Panel1 style={{ height: 220, borderRadius: 12 }} />
              <HueSlider style={{ height: 32, borderRadius: 16 }} />
            </ColorPicker>
          </View>

          <View style={styles.hexRow}>
            <Text style={[styles.hexLabel, { color: theme.colors.textSecondary }]}>
              Cor atual
            </Text>
            <Text style={[styles.hexValue, { color: theme.colors.text }]}>
              {picked.toUpperCase()}
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btn, { borderColor: theme.colors.border }]}
              onPress={onClose}
            >
              <Text style={[styles.btnText, { color: theme.colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnPrimary, { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                onSave(picked);
                onClose();
              }}
            >
              <Ionicons name="checkmark" size={18} color="#FFF" />
              <Text style={styles.btnPrimaryText}>Salvar</Text>
            </TouchableOpacity>
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
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    ...shadows.lg,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  title: { fontSize: 18, fontWeight: '800', marginBottom: spacing.md },
  pickerWrapper: { marginTop: spacing.sm },
  hexRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
  hexLabel: { fontSize: 13 },
  hexValue: { fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  btnText: { fontSize: 15, fontWeight: '700' },
  btnPrimary: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 0,
  },
  btnPrimaryText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default ColorPickerModal;