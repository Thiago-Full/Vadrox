// src/store/useAiSuggestionsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Track } from './usePlayerStore';

const MAX_SUGGESTIONS = 50;

interface AiSuggestionsState {
  suggestions: Track[];
  addSuggestions: (tracks: Track[]) => void;
  clear: () => void;
}

export const useAiSuggestionsStore = create<AiSuggestionsState>()(
  persist(
    (set) => ({
      suggestions: [],
      addSuggestions: (tracks) =>
        set((s) => {
          const incoming = tracks.filter((t) => t && t.id);
          const incomingIds = new Set(incoming.map((t) => t.id));
          const oldKept = s.suggestions.filter((t) => !incomingIds.has(t.id));
          return { suggestions: [...incoming, ...oldKept].slice(0, MAX_SUGGESTIONS) };
        }),
      clear: () => set({ suggestions: [] }),
    }),
    {
      name: 'vadrox-ai-suggestions',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);