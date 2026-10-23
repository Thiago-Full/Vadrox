// src/store/useRecommendationsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Track } from './usePlayerStore';

const RENDER_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://vadrox-backend.onrender.com';

const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 horas

interface RecommendationsState {
  tracks: Track[];
  lastFetch: number;
  loading: boolean;
  adventureLevel: number;

  fetchRecommendations: (artists: string[], genres?: string[]) => Promise<void>;
  forceRefresh: (artists: string[], genres?: string[]) => Promise<void>;
  setAdventureLevel: (level: number) => void;
}

export const useRecommendationsStore = create<RecommendationsState>()(
  persist(
    (set, get) => ({
      tracks: [],
      lastFetch: 0,
      loading: false,
      adventureLevel: 50,

      fetchRecommendations: async (artists: string[], genres: string[] = []) => {
        const { lastFetch, tracks, loading, adventureLevel } = get();

        if (Date.now() - lastFetch < CACHE_TTL && tracks.length > 0) {
          console.log('[RECS] usando cache');
          return;
        }

        if (loading) {
          console.log('[RECS] já em loading, ignorando');
          return;
        }

        set({ loading: true });
        console.log('[RECS] FETCH iniciado | level:', adventureLevel, '| artists:', artists);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

        try {
          const res = await fetch(`${RENDER_URL}/recommendations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ artists, genres, adventureLevel }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          const data = await res.json();
          set({
            tracks: data.tracks ?? [],
            lastFetch: Date.now(),
            loading: false,
          });
          console.log('[RECS] recebidas', data.tracks?.length ?? 0, 'faixas');
        } catch (e: any) {
          clearTimeout(timeoutId);
          console.error('[RECS] erro no fetch:', String(e?.message ?? e));
          set({ loading: false });
        }
      },

      forceRefresh: async (artists: string[], genres: string[] = []) => {
        set({ lastFetch: 0 });
        await get().fetchRecommendations(artists, genres);
      },

      setAdventureLevel: (level) => {
        const clamped = Math.max(0, Math.min(100, level));
        const current = get().adventureLevel;
        if (clamped === current) return;
        console.log('[RECS] adventureLevel:', current, '→', clamped);
        set({ adventureLevel: clamped, lastFetch: 0 });
      },
    }),
    {
      name: 'vadrox-recommendations-v2', // ← NOME NOVO! Reseta cache do celular
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        tracks: s.tracks,
        lastFetch: s.lastFetch,
        adventureLevel: s.adventureLevel,
        // loading NÃO é salvo — sempre reseta pro default false
      }),
    },
  ),
);