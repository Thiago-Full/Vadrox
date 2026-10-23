// src/store/useThemeStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppTheme, createTheme, ThemeMode } from '../theme/theme';

interface ThemeState {
  mode: ThemeMode;
  presetId: string;
  theme: AppTheme;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setPreset: (presetId: string) => void;
  setBubbleOverride: (hex: string | undefined) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: 'dark',
      presetId: 'violet-storm',
      theme: createTheme('dark', 'violet-storm'),

      setMode: (mode) =>
        set({ mode, theme: createTheme(mode, get().presetId) }),

      toggleMode: () => {
        const next: ThemeMode = get().mode === 'dark' ? 'light' : 'dark';
        set({ mode: next, theme: createTheme(next, get().presetId) });
      },

      setPreset: (presetId) =>
        set({ presetId, theme: createTheme(get().mode, presetId) }),

      setBubbleOverride: (hex) =>
        set({
          theme: createTheme(get().mode, get().presetId, hex),
        }),
    }),
    {
      name: 'vadrox-theme-v2',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ mode: s.mode, presetId: s.presetId }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          useThemeStore.setState({
            theme: createTheme(state.mode, state.presetId),
          });
        }
      },
    },
  ),
);