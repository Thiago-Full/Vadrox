// src/components/ui/RgbColorPicker.tsx
import React, { FC } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

import { useThemeStore } from '../../store/useThemeStore';
import { spacing, radius } from '../../theme/theme';

interface Props {
  color: string; // #RRGGBB
  onChange: (hex: string) => void;
}

const hexToRgb = (hex: string) => {
  const h = (hex || '#000000').replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16) || 0,
    g: parseInt(h.slice(2, 4), 16) || 0,
    b: parseInt(h.slice(4, 6), 16) || 0,
  };
};

const toHex = (n: number) =>
  Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');

const RgbColorPicker: FC<Props> = ({ color, onChange }) => {
  const theme = useThemeStore((s) => s.theme);
  const { r, g, b } = hexToRgb(color);

  const update = (nr: number, ng: number, nb: number) => {
    onChange(`#${toHex(nr)}${toHex(ng)}${toHex(nb)}`);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.preview, { backgroundColor: color, borderColor: theme.colors.border }]} />
      <Text style={[styles.hex, { color: theme.colors.text }]}>{color.toUpperCase()}</Text>

      <View style={styles.row}>
        <Text style={[styles.channel, { color: '#E5484D' }]}>R</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={255}
          value={r}
          minimumTrackTintColor="#E5484D"
          maximumTrackTintColor={theme.colors.border}
          thumbTintColor="#E5484D"
          onValueChange={(v) => update(v, g, b)}
        />
        <Text style={[styles.value, { color: theme.colors.text }]}>{Math.round(r)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.channel, { color: '#30A46C' }]}>G</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={255}
          value={g}
          minimumTrackTintColor="#30A46C"
          maximumTrackTintColor={theme.colors.border}
          thumbTintColor="#30A46C"
          onValueChange={(v) => update(r, v, b)}
        />
        <Text style={[styles.value, { color: theme.colors.text }]}>{Math.round(g)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.channel, { color: '#3B82F6' }]}>B</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={255}
          value={b}
          minimumTrackTintColor="#3B82F6"
          maximumTrackTintColor={theme.colors.border}
          thumbTintColor="#3B82F6"
          onValueChange={(v) => update(r, g, v)}
        />
        <Text style={[styles.value, { color: theme.colors.text }]}>{Math.round(b)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
  preview: {
    height: 56,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  hex: { fontSize: 12, fontWeight: '700', textAlign: 'center', letterSpacing: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  channel: { width: 16, fontSize: 13, fontWeight: '800' },
  slider: { flex: 1, height: 40 },
  value: { width: 36, fontSize: 12, textAlign: 'right' },
});

export default RgbColorPicker;