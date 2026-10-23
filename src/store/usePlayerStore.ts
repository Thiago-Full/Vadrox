// src/store/usePlayerStore.ts
import { create } from 'zustand';
import {
  playQueue,
  togglePlayback,
  skipNext,
  skipPrevious,
  seekToPosition,
} from '../services/player';
import { useHistoryStore } from './useHistoryStore';
import { useDownloadStore } from './useDownloadStore';
import { VadroxAPI } from '../services/api';

export interface Track {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  duration: number;
  url: string;
  playedAt?: number;   // ← NOVO
}

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  position: number;
  duration: number;

  play: (track: Track, queue?: Track[]) => Promise<void>;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  setPosition: (seconds: number) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  position: 0,
  duration: 0,

  play: async (track, queue) => {
    const fullQueue = queue ?? get().queue;
    const index = fullQueue.findIndex((t) => t.id === track.id);
    const startIndex = index >= 0 ? index : 0;

    const getPath = useDownloadStore.getState().getPath;

    // ─── Resolve URL de cada faixa (async) ───
    const withUrls = await Promise.all(
      fullQueue.map(async (t) => {
        // 1. Baixada? usa local
        const localPath = getPath(t.id);
        if (localPath) return { ...t, url: `file://${localPath}` };

        // 2. Já tem URL? usa
        if (t.url && t.url.length > 0) return t;

        // 3. Busca a URL do stream (async)
        try {
          const url = await VadroxAPI.getStreamUrl(t.id);
          return { ...t, url };
        } catch {
          return { ...t, url: '' };
        }
      }),
    );

    const resolvedTrack =
      withUrls.find((t) => t.id === track.id) ?? { ...track, url: '' };

    set({
      currentTrack: resolvedTrack,
      queue: withUrls,
      isPlaying: true,
      position: 0,
    });

    try {
      useHistoryStore.getState().addToHistory(resolvedTrack);
    } catch (e) {
      console.error('[STORE] falha ao logar histórico:', e);
    }

    try {
      await playQueue(
        withUrls.map((t) => ({
          id: t.id,
          url: t.url,
          title: t.title,
          artist: t.artist,
          artwork: t.artwork,
          duration: t.duration,
        })),
        startIndex,
      );
    } catch (e) {
      console.error('[STORE] play falhou:', e);
      set({ isPlaying: false });
    }
  },

  toggle: () => togglePlayback(),
  next: () => skipNext(),
  previous: () => skipPrevious(),
  setPosition: (seconds) => {
    set({ position: seconds });
    seekToPosition(seconds);
  },
}));