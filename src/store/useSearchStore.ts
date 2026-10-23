// src/store/useSearchStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SearchState {
  recentSearches: string[];
  addRecent: (q: string) => void;
  clearRecent: () => void;
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      recentSearches: [],
      addRecent: (q) =>
        set((s) => {
          const trimmed = q.trim();
          if (!trimmed) return s;
          const filtered = s.recentSearches.filter((x) => x !== trimmed);
          return { recentSearches: [trimmed, ...filtered].slice(0, 8) };
        }),
      clearRecent: () => set({ recentSearches: [] }),
    }),
    {
      name: 'vadrox-search',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);