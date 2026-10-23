// src/store/usePlaylistStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Track } from './usePlayerStore';

export interface Playlist {
  id: string;
  name: string;
  coverUrl?: string;
  tracks: Track[];
}

interface PlaylistState {
  playlists: Playlist[];
  createPlaylist: (name: string) => string;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  setCover: (playlistId: string, coverUrl: string) => void;
  renamePlaylist: (playlistId: string, name: string) => void;
}

const uid = () => Math.random().toString(36).slice(2);

export const usePlaylistStore = create<PlaylistState>()(
  persist(
    (set) => ({
      playlists: [],

      createPlaylist: (name) => {
        const id = uid();
        set((s) => ({ playlists: [...s.playlists, { id, name, tracks: [] }] }));
        return id;
      },

      addTrackToPlaylist: (playlistId, track) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId && !p.tracks.some((t) => t.id === track.id)
              ? { ...p, tracks: [...p.tracks, track] }
              : p,
          ),
        })),

      removeTrackFromPlaylist: (playlistId, trackId) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId
              ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) }
              : p,
          ),
        })),

      deletePlaylist: (playlistId) =>
        set((s) => ({ playlists: s.playlists.filter((p) => p.id !== playlistId) })),

      setCover: (playlistId, coverUrl) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId ? { ...p, coverUrl } : p,
          ),
        })),

      renamePlaylist: (playlistId, name) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId ? { ...p, name } : p,
          ),
        })),
    }),
    {
      name: 'vadrox-playlists-v2',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);