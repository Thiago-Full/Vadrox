// src/theme/theme.ts
export type ThemeMode = 'light' | 'dark';

export interface BubbleStyle {
  topLeft: number;
  topRight: number;
  bottomLeft: number;
  bottomRight: number;
  borderWidth: number;
  glow: boolean;
  lightText: boolean; // true = texto escuro (balão claro)
}

export interface ThemePreset {
  id: string;
  name: string;
  icon: string;
  primary: string;
  accent: string;
  backgroundDark: string;
  backgroundLight: string;
  surfaceDark: string;
  surfaceLight: string;
  cardDark: string;
  cardLight: string;
  bubbleColor: string;
  bubbleStyle: BubbleStyle;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'violet-storm',
    name: 'Violet Storm',
    icon: 'flash',
    primary: '#8B5CF6',
    accent: '#A78BFA',
    backgroundDark: '#0B0B0F',
    backgroundLight: '#F8F7FC',
    surfaceDark: '#15151C',
    surfaceLight: '#EFEBF7',
    cardDark: '#1C1C24',
    cardLight: '#FFFFFF',
    bubbleColor: '#8B5CF6',
    bubbleStyle: { topLeft: 20, topRight: 20, bottomLeft: 4, bottomRight: 20, borderWidth: 0, glow: false, lightText: false },
  },
  {
    id: 'blood-moon',
    name: 'Blood Moon',
    icon: 'moon',
    primary: '#DC2626',
    accent: '#F87171',
    backgroundDark: '#0F0505',
    backgroundLight: '#FDF6F6',
    surfaceDark: '#1A0A0A',
    surfaceLight: '#F5E8E8',
    cardDark: '#220D0D',
    cardLight: '#FFFFFF',
    bubbleColor: '#DC2626',
    bubbleStyle: { topLeft: 4, topRight: 4, bottomLeft: 4, bottomRight: 4, borderWidth: 0, glow: false, lightText: false },
  },
  {
    id: 'cherry',
    name: 'Cherry',
    icon: 'flower',
    primary: '#EC4899',
    accent: '#F9A8D4',
    backgroundDark: '#0F060C',
    backgroundLight: '#FDF5F9',
    surfaceDark: '#1A0A14',
    surfaceLight: '#F8E5EF',
    cardDark: '#230E1B',
    cardLight: '#FFFFFF',
    bubbleColor: '#EC4899',
    bubbleStyle: { topLeft: 26, topRight: 26, bottomLeft: 26, bottomRight: 26, borderWidth: 0, glow: false, lightText: false },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    icon: 'planet',
    primary: '#3B82F6',
    accent: '#93C5FD',
    backgroundDark: '#05080F',
    backgroundLight: '#F5F8FD',
    surfaceDark: '#0A1018',
    surfaceLight: '#E8EFF8',
    cardDark: '#0F1620',
    cardLight: '#FFFFFF',
    bubbleColor: '#3B82F6',
    bubbleStyle: { topLeft: 20, topRight: 20, bottomLeft: 20, bottomRight: 4, borderWidth: 0, glow: false, lightText: false },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    icon: 'sunny',
    primary: '#F97316',
    accent: '#FB923C',
    backgroundDark: '#0F0805',
    backgroundLight: '#FDF7F3',
    surfaceDark: '#1A100A',
    surfaceLight: '#F8EBE0',
    cardDark: '#231710',
    cardLight: '#FFFFFF',
    bubbleColor: '#F97316',
    bubbleStyle: { topLeft: 22, topRight: 22, bottomLeft: 22, bottomRight: 6, borderWidth: 0, glow: false, lightText: false },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    icon: 'water',
    primary: '#06B6D4',
    accent: '#67E8F9',
    backgroundDark: '#04121A',
    backgroundLight: '#F0FAFC',
    surfaceDark: '#081B24',
    surfaceLight: '#DFF3F8',
    cardDark: '#0C242F',
    cardLight: '#FFFFFF',
    bubbleColor: '#06B6D4',
    bubbleStyle: { topLeft: 24, topRight: 24, bottomLeft: 24, bottomRight: 24, borderWidth: 0, glow: false, lightText: false },
  },
  {
    id: 'forest',
    name: 'Forest',
    icon: 'leaf',
    primary: '#10B981',
    accent: '#6EE7B7',
    backgroundDark: '#05100B',
    backgroundLight: '#F0FBF5',
    surfaceDark: '#0A1A12',
    surfaceLight: '#E0F5E9',
    cardDark: '#0F2418',
    cardLight: '#FFFFFF',
    bubbleColor: '#10B981',
    bubbleStyle: { topLeft: 8, topRight: 20, bottomLeft: 20, bottomRight: 20, borderWidth: 0, glow: false, lightText: false },
  },
  {
    id: 'neon',
    name: 'Neon',
    icon: 'sparkles',
    primary: '#39FF14',
    accent: '#FF10F0',
    backgroundDark: '#000000',
    backgroundLight: '#F0FFF4',
    surfaceDark: '#0A0A0A',
    surfaceLight: '#E0FFE8',
    cardDark: '#101010',
    cardLight: '#FFFFFF',
    bubbleColor: '#D4FFD9', // fundo claro verde
    bubbleStyle: {
      topLeft: 8,
      topRight: 8,
      bottomLeft: 8,
      bottomRight: 8,
      borderWidth: 2,
      glow: true,
      lightText: true, // texto escuro no balão claro
    },
  },
  {
    id: 'amethyst',
    name: 'Amethyst',
    icon: 'diamond',
    primary: '#A855F7',
    accent: '#C4B5FD',
    backgroundDark: '#0C0712',
    backgroundLight: '#F9F5FD',
    surfaceDark: '#150E1D',
    surfaceLight: '#EFE5F7',
    cardDark: '#1C1228',
    cardLight: '#FFFFFF',
    bubbleColor: '#A855F7',
    bubbleStyle: { topLeft: 22, topRight: 22, bottomLeft: 22, bottomRight: 22, borderWidth: 0, glow: false, lightText: false },
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    icon: 'heart',
    primary: '#F472B6',
    accent: '#FBBF24',
    backgroundDark: '#120810',
    backgroundLight: '#FDF6FA',
    surfaceDark: '#1E0E1A',
    surfaceLight: '#F8E8F0',
    cardDark: '#281320',
    cardLight: '#FFFFFF',
    bubbleColor: '#F472B6',
    bubbleStyle: { topLeft: 26, topRight: 8, bottomLeft: 26, bottomRight: 26, borderWidth: 0, glow: false, lightText: false },
  },
  {
    id: 'candy',
    name: 'Candy',
    icon: 'ice-cream',
    primary: '#F472B6',
    accent: '#60A5FA',
    backgroundDark: '#0A0812',
    backgroundLight: '#FBF5FD',
    surfaceDark: '#15101E',
    surfaceLight: '#F0E5F8',
    cardDark: '#1D1528',
    cardLight: '#FFFFFF',
    bubbleColor: '#F472B6',
    bubbleStyle: { topLeft: 28, topRight: 28, bottomLeft: 28, bottomRight: 28, borderWidth: 0, glow: false, lightText: false },
  },
  {
    id: 'mono',
    name: 'Mono',
    icon: 'contrast',
    primary: '#71717A',
    accent: '#A1A1AA',
    backgroundDark: '#0A0A0A',
    backgroundLight: '#FAFAFA',
    surfaceDark: '#141414',
    surfaceLight: '#EFEFEF',
    cardDark: '#1C1C1C',
    cardLight: '#FFFFFF',
    bubbleColor: '#52525B',
    bubbleStyle: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0, borderWidth: 1, glow: false, lightText: false },
  },
];

export interface AppTheme {
  mode: ThemeMode;
  presetId: string;
  presetName: string;
  presetIcon: string;
  colors: {
    primary: string;
    primarySoft: string;
    accent: string;
    background: string;
    surface: string;
    surfaceLight: string;
    card: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    icon: string;
    border: string;
    divider: string;
    gradientHeader: [string, string];
    gradientPlayer: [string, string];
    success: string;
    danger: string;
    overlay: string;
    overlayDark: string;
    white: string;
    bubbleColor: string;
    bubbleStyle: BubbleStyle;
  };
}

const hexToRgba = (hex: string, alpha: number): string => {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const createTheme = (
  mode: ThemeMode,
  presetId: string = 'violet-storm',
  bubbleColorOverride?: string,
): AppTheme => {
  const isDark = mode === 'dark';
  const preset =
    THEME_PRESETS.find((p) => p.id === presetId) || THEME_PRESETS[0];

  const finalBubbleColor = bubbleColorOverride || preset.bubbleColor;

  return {
    mode,
    presetId: preset.id,
    presetName: preset.name,
    presetIcon: preset.icon,
    colors: {
      primary: preset.primary,
      primarySoft: hexToRgba(preset.primary, isDark ? 0.22 : 0.14),
      accent: preset.accent,
      background: isDark ? preset.backgroundDark : preset.backgroundLight,
      surface: isDark ? preset.surfaceDark : preset.surfaceLight,
      surfaceLight: isDark ? preset.surfaceDark : preset.surfaceLight,
      card: isDark ? preset.cardDark : preset.cardLight,
      text: isDark ? '#F5F5F7' : '#0B0B0F',
      textSecondary: isDark ? '#A1A1AA' : '#52525B',
      textTertiary: isDark ? '#71717A' : '#8B8B94',
      icon: isDark ? '#E4E4E7' : '#18181B',
      border: isDark ? '#26262F' : '#E4E4E7',
      divider: isDark ? '#26262F' : '#E4E4E7',
      gradientHeader: [
        hexToRgba(preset.primary, isDark ? 0.45 : 0.30),
        'transparent',
      ],
      gradientPlayer: [hexToRgba(preset.primary, 0.35), 'transparent'],
      success: '#22C55E',
      danger: '#EF4444',
      overlay: 'rgba(0,0,0,0.35)',
      overlayDark: 'rgba(0,0,0,0.55)',
      white: '#FFFFFF',
      bubbleColor: finalBubbleColor,
      bubbleStyle: preset.bubbleStyle,
    },
  };
};

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32,
} as const;

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 24, pill: 999,
} as const;

export const typography = {
  h1:      { fontSize: 28, fontWeight: '700' as const },
  h2:      { fontSize: 22, fontWeight: '700' as const },
  h3:      { fontSize: 18, fontWeight: '600' as const },
  body:    { fontSize: 15, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
  small:   { fontSize: 11, fontWeight: '500' as const },
} as const;

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;