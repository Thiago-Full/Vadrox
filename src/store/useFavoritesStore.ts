// src/store/useFavoritesStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Track } from './usePlayerStore';

interface FavoritesState {
  favorites: Track[];
  toggle: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
  clear: () => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggle: (track) =>
        set((s) => {
          const exists = s.favorites.some((t) => t.id === track.id);
          return {
            favorites: exists
              ? s.favorites.filter((t) => t.id !== track.id)
              : [track, ...s.favorites],
          };
        }),

      isFavorite: (trackId) => get().favorites.some((t) => t.id === trackId),

      clear: () => set({ favorites: [] }),
    }),
    {
      name: 'vadrox-favorites',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);