// src/store/useHistoryStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Track } from './usePlayerStore';

const MAX_HISTORY = 200;

interface HistoryState {
  history: Track[];
  addToHistory: (track: Track) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set) => ({
      history: [],
      addToHistory: (track) =>
        set((s) => {
          const entry: Track = { ...track, playedAt: Date.now() };
          const filtered = s.history.filter((t) => t.id !== track.id);
          return { history: [entry, ...filtered].slice(0, MAX_HISTORY) };
        }),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: 'vadrox-history',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);