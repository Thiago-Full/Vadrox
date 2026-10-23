// src/components/ui/TrackOptionsModal.tsx
import React, { FC, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Share,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useThemeStore } from '../../store/useThemeStore';
import { Track } from '../../store/usePlayerStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { usePlaylistStore } from '../../store/usePlaylistStore';
import { useDownloadStore } from '../../store/useDownloadStore';
import { downloadTrack, deleteDownloadedFile } from '../../services/player';
import { VadroxAPI } from '../../services/api';
import { spacing, radius, shadows } from '../../theme/theme';
import CreatePlaylistModal from './CreatePlaylistModal';

interface Props {
  visible: boolean;
  onClose: () => void;
  track: Track;
}

const TrackOptionsModal: FC<Props> = ({ visible, onClose, track }) => {
  const theme = useThemeStore((s) => s.theme);
  const favorites = useFavoritesStore((s) => s.favorites);
  const toggleFavorite = useFavoritesStore((s) => s.toggle);
  const isFav = favorites.some((t) => t.id === track.id);

  const playlists = usePlaylistStore((s) => s.playlists);
  const addTrackToPlaylist = usePlaylistStore((s) => s.addTrackToPlaylist);

  const downloads = useDownloadStore((s) => s.downloads);
  const addDownload = useDownloadStore((s) => s.addDownload);
  const removeDownload = useDownloadStore((s) => s.removeDownload);
  const isDownloaded = !!downloads[track.id];

  const [showPlaylists, setShowPlaylists] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [toast, setToast] = useState('');

  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 1600);
  };

  const handleAdd = (playlistId: string, playlistName: string) => {
    addTrackToPlaylist(playlistId, track);
    flash(`Adicionada a "${playlistName}"`);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🎵 ${track.title} — ${track.artist}\n\nOuvindo no Vadrox 🎧`,
      });
    } catch (e) {
      console.error('[SHARE] erro:', e);
    }
  };

  const handleDownload = async () => {
    if (downloading) return;

    if (isDownloaded) {
      const path = downloads[track.id];
      if (path) await deleteDownloadedFile(path);
      removeDownload(track.id);
      flash('Download removido');
      return;
    }

    setDownloading(true);
    setProgress(0);
    const streamUrl = await VadroxAPI.getAudioUrl(track.id);
    const path = await downloadTrack(track.id, streamUrl, setProgress);
    setDownloading(false);

    if (path) {
      addDownload(track, path);
      flash('Download concluído');
    } else {
      flash('Falha no download');
    }
  };

  return (
    <>
      <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={onClose}>
          <Pressable
            style={[
              styles.sheet,
              { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />
            <Text numberOfLines={1} style={[styles.title, { color: theme.colors.text }]}>
              {track.title}
            </Text>

            <ScrollView style={{ maxHeight: 420 }}>
              {/* Baixar / Remover download */}
              <TouchableOpacity
                style={styles.row}
                onPress={handleDownload}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Ionicons
                    name={isDownloaded ? 'trash-outline' : 'cloud-download-outline'}
                    size={22}
                    color={isDownloaded ? theme.colors.danger : theme.colors.text}
                  />
                )}
                <Text style={[styles.rowText, { color: theme.colors.text }]}>
                  {downloading
                    ? `Baixando... ${Math.round(progress)}%`
                    : isDownloaded
                    ? 'Remover download'
                    : 'Baixar'}
                </Text>
              </TouchableOpacity>

              {/* Compartilhar */}
              <TouchableOpacity style={styles.row} onPress={handleShare}>
                <Ionicons name="share-outline" size={22} color={theme.colors.text} />
                <Text style={[styles.rowText, { color: theme.colors.text }]}>
                  Compartilhar
                </Text>
              </TouchableOpacity>

              {/* Favoritar */}
              <TouchableOpacity style={styles.row} onPress={() => toggleFavorite(track)}>
                <Ionicons
                  name={isFav ? 'heart' : 'heart-outline'}
                  size={22}
                  color={isFav ? theme.colors.primary : theme.colors.text}
                />
                <Text style={[styles.rowText, { color: theme.colors.text }]}>
                  {isFav ? 'Remover dos Favoritos' : 'Favoritar'}
                </Text>
              </TouchableOpacity>

              {/* Adicionar à playlist */}
              <TouchableOpacity style={styles.row} onPress={() => setShowPlaylists((v) => !v)}>
                <Ionicons name="add-circle-outline" size={22} color={theme.colors.text} />
                <Text style={[styles.rowText, { color: theme.colors.text }]}>
                  Adicionar à Playlist
                </Text>
                <Ionicons
                  name={showPlaylists ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>

              {showPlaylists && (
                <View style={[styles.playlistsBox, { borderColor: theme.colors.border }]}>
                  {playlists.length === 0 && (
                    <Text style={[styles.emptyPlaylist, { color: theme.colors.textTertiary }]}>
                      Nenhuma playlist ainda
                    </Text>
                  )}
                  {playlists.map((p) => {
                    const already = p.tracks.some((t) => t.id === track.id);
                    return (
                      <TouchableOpacity
                        key={p.id}
                        style={styles.playlistRow}
                        onPress={() => handleAdd(p.id, p.name)}
                      >
                        <Ionicons
                          name="musical-notes-outline"
                          size={18}
                          color={theme.colors.primary}
                        />
                        <Text style={[styles.playlistName, { color: theme.colors.text }]}>
                          {p.name}
                        </Text>
                        {already && (
                          <Ionicons name="checkmark" size={16} color={theme.colors.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            {toast ? (
              <Text style={[styles.toast, { color: theme.colors.primary }]}>{toast}</Text>
            ) : null}

            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => setCreateOpen(true)}
            >
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.createText}>Criar Playlist</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <CreatePlaylistModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(id) => {
          addTrackToPlaylist(id, track);
          flash('Playlist criada e faixa adicionada');
          setShowPlaylists(true);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    ...shadows.lg,
  },
  handle: { width: 44, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.md },
  title: { fontSize: 16, fontWeight: '700', marginBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  rowText: { flex: 1, fontSize: 15 },
  playlistsBox: {
    marginLeft: spacing.xl,
    borderLeftWidth: 1,
    paddingLeft: spacing.md,
    marginBottom: spacing.sm,
  },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  playlistName: { flex: 1, fontSize: 14 },
  emptyPlaylist: { fontSize: 13, paddingVertical: spacing.sm },
  toast: { textAlign: 'center', fontSize: 13, fontWeight: '600', marginBottom: spacing.sm },
  createBtn: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    gap: spacing.sm,
  },
  createText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default TrackOptionsModal;