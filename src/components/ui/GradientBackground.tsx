// src/components/ui/GradientBackground.tsx
import React, { FC } from 'react';
import { StyleSheet } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface Props {
  colors: [string, string] | string[];
  height?: number;
}

const GradientBackground: FC<Props> = ({ colors, height = 320 }) => (
  <LinearGradient
    colors={colors as string[]}
    start={{ x: 0.5, y: 0 }}
    end={{ x: 0.5, y: 1 }}
    style={[styles.gradient, { height }]}
    pointerEvents="none"
  />
);

const styles = StyleSheet.create({
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
});

export default GradientBackground;