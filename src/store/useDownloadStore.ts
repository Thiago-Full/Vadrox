// src/store/useDownloadStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Track } from './usePlayerStore';

interface DownloadState {
  // Compat com versão antiga (trackId → path)
  downloads: Record<string, string>;
  // Lista completa dos tracks baixados (mais recentes primeiro)
  downloadedTracks: Track[];

  addDownload: (track: Track, path: string) => void;
  removeDownload: (trackId: string) => void;
  getPath: (trackId: string) => string | undefined;
  getTracks: () => Track[];
  clearAll: () => void;
}

export const useDownloadStore = create<DownloadState>()(
  persist(
    (set, get) => ({
      downloads: {},
      downloadedTracks: [],

      addDownload: (track, path) =>
        set((s) => {
          // Remove duplicata se já existir
          const withoutDup = s.downloadedTracks.filter((t) => t.id !== track.id);
          return {
            downloads: { ...s.downloads, [track.id]: path },
            // Mais recente no topo
            downloadedTracks: [track, ...withoutDup],
          };
        }),

      removeDownload: (trackId) =>
        set((s) => {
          const next = { ...s.downloads };
          delete next[trackId];
          return {
            downloads: next,
            downloadedTracks: s.downloadedTracks.filter((t) => t.id !== trackId),
          };
        }),

      getPath: (trackId) => get().downloads[trackId],

      getTracks: () => get().downloadedTracks,

      clearAll: () => set({ downloads: {}, downloadedTracks: [] }),
    }),
    {
      name: 'vadrox-downloads-v2',
      storage: createJSONStorage(() => AsyncStorage),
      // Migração: se existir formato antigo, vira {} (usuário re-baixa)
      version: 2,
      migrate: (persistedState: any) => {
        if (persistedState && !persistedState.downloadedTracks) {
          return { downloads: {}, downloadedTracks: [] };
        }
        return persistedState;
      },
    },
  ),
);