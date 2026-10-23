// src/services/player.ts
import TrackPlayer, {
  PlayerCommand,
  Event,
  type MediaItem,
} from '@rntp/player';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { usePlayerStore } from '../store/usePlayerStore';

let setupDone = false;

const MUSIC_DIR = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/vadrox-music`;

// ─── Sincroniza o Zustand com a faixa ativa ───
function syncActiveTrack(): void {
  try {
    const active = TrackPlayer.getActiveMediaItem();
    if (!active) return;
    const id = String((active as any).mediaId ?? (active as any).id ?? '');
    if (!id) return;

    const cur = usePlayerStore.getState();
    if (cur.currentTrack?.id !== id) {
      const found = cur.queue.find((t) => t.id === id);
      if (found) {
        usePlayerStore.setState({ currentTrack: found });
        console.log('[VADROX] UI sincronizada →', found.title);
      }
    }
  } catch (e) {
    // silencioso
  }
}

export function setupTrackPlayer(): void {
  if (setupDone) return;
  setupDone = true;

  try {
    TrackPlayer.setupPlayer({
      contentType: 'music',
      handleAudioBecomingNoisy: true,
      android: { taskRemovedBehavior: 'stop' },
    });

    TrackPlayer.setCommands({
      capabilities: [
        PlayerCommand.PlayPause,
        PlayerCommand.Next,
        PlayerCommand.Previous,
      ],
      handling: 'native',
    });

    TrackPlayer.addEventListener(Event.IsPlayingChanged, (e: any) => {
      usePlayerStore.setState({ isPlaying: !!e.playing });
    });

    TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (e: any) => {
      usePlayerStore.setState({
        position: e.position ?? 0,
        duration: e.duration ?? 0,
      });
    });

    TrackPlayer.addEventListener(Event.MediaItemTransition, (e: any) => {
      console.log('[VADROX] MediaItemTransition:', JSON.stringify(e));
      const id = String(
        e?.mediaId ?? e?.item?.mediaId ?? e?.item?.id ?? e?.track?.id ?? '',
      );
      if (!id) return;
      const cur = usePlayerStore.getState();
      if (cur.currentTrack?.id !== id) {
        const found = cur.queue.find((t) => t.id === id);
        if (found) {
          usePlayerStore.setState({ currentTrack: found });
          console.log('[VADROX] track mudou pra:', found.title);
        }
      }
    });

    TrackPlayer.addEventListener(Event.PlaybackError, (e: any) => {
      console.log('[VADROX] PlaybackError:', JSON.stringify(e));
      setTimeout(() => {
        try {
          TrackPlayer.skipToNext();
          TrackPlayer.play();
        } catch {}
      }, 500);
    });

    // Polling de segurança (1s)
    setInterval(() => {
      syncActiveTrack();
    }, 1000);

    console.log('[VADROX] setup OK');
  } catch (e) {
    console.error('[VADROX] setup FALHOU:', e);
    setupDone = false;
  }
}

export async function playQueue(
  queue: {
    id: string;
    url: string;
    title: string;
    artist: string;
    artwork?: string | null;
    duration?: number;
  }[],
  startIndex: number,
): Promise<void> {
  setupTrackPlayer();

  console.log('[VADROX] playQueue: parando player atual...');

  try { TrackPlayer.stop(); } catch (e) { console.log('[VADROX] stop falhou:', e); }
  try { TrackPlayer.clear(); } catch (e) { console.log('[VADROX] clear falhou:', e); }

  await new Promise((resolve) => setTimeout(resolve, 200));

  const items: MediaItem[] = queue.map((t) => {
    const item: MediaItem = {
      mediaId: String(t.id),
      url: String(t.url),
      title: t.title || 'Sem título',
      artist: t.artist || 'Artista desconhecido',
    };
    if (t.artwork && typeof t.artwork === 'string' && t.artwork.length > 0) {
      item.artworkUrl = t.artwork;
    }
    if (typeof t.duration === 'number' && t.duration > 0) {
      item.duration = t.duration;
    }
    return item;
  });

  console.log('[VADROX] playQueue: setMediaItems com', items.length, 'itens, índice', startIndex);

  TrackPlayer.setMediaItems(items, startIndex);
  TrackPlayer.seekTo(0);
  TrackPlayer.play();

  setTimeout(() => syncActiveTrack(), 500);
}

export function togglePlayback(): void {
  if (TrackPlayer.isPlaying()) {
    TrackPlayer.pause();
  } else {
    TrackPlayer.play();
  }
}

export function skipNext(): void {
  console.log('[VADROX] skipNext chamado');
  try {
    TrackPlayer.skipToNext();
    TrackPlayer.play();
    setTimeout(() => syncActiveTrack(), 300);
  } catch (e) {
    console.log('[VADROX] skipNext falhou:', e);
  }
}

export function skipPrevious(): void {
  console.log('[VADROX] skipPrevious chamado');
  try {
    TrackPlayer.skipToPrevious();
    TrackPlayer.play();
    setTimeout(() => syncActiveTrack(), 300);
  } catch (e) {
    console.log('[VADROX] skipPrevious falhou:', e);
  }
}

export function seekToPosition(seconds: number): void {
  TrackPlayer.seekTo(seconds);
}

export function setShuffle(enabled: boolean): void {
  TrackPlayer.setShuffleEnabled(enabled);
}

export function isShuffleEnabled(): boolean {
  return TrackPlayer.isShuffleEnabled();
}

export function setRepeat(mode: 'off' | 'queue' | 'track'): void {
  TrackPlayer.setRepeatMode(mode as any);
}

/**
 * Baixa o áudio de uma faixa pro storage interno do app.
 */
export async function downloadTrack(
  id: string,
  streamUrl: string,
  onProgress?: (pct: number) => void,
): Promise<string | null> {
  try {
    const dirExists = await ReactNativeBlobUtil.fs.exists(MUSIC_DIR);
    if (!dirExists) {
      await ReactNativeBlobUtil.fs.mkdir(MUSIC_DIR);
    }

    const filePath = `${MUSIC_DIR}/${id}.m4a`;

    const fileExists = await ReactNativeBlobUtil.fs.exists(filePath);
    if (fileExists) {
      onProgress?.(100);
      return filePath;
    }

    const res = await ReactNativeBlobUtil.config({
      fileCache: false,
      path: filePath,
      timeout: 120000,
    })
      .fetch('GET', streamUrl)
      .progress({ interval: 250 }, (received: number, total: number) => {
        if (total && total > 0 && onProgress) {
          onProgress(Math.min(100, (received / total) * 100));
        }
      });

    const status = res.info().status;
    if (status === 200 || status === 206) {
      return filePath;
    }

    await ReactNativeBlobUtil.fs.unlink(filePath).catch(() => {});
    return null;
  } catch (e) {
    console.error('[DOWNLOAD] erro:', e);
    return null;
  }
}

/**
 * Deleta o arquivo baixado.
 */
export async function deleteDownloadedFile(path: string): Promise<void> {
  try {
    const cleanPath = path.replace('file://', '');
    const exists = await ReactNativeBlobUtil.fs.exists(cleanPath);
    if (exists) await ReactNativeBlobUtil.fs.unlink(cleanPath);
  } catch (e) {
    console.error('[DOWNLOAD] delete erro:', e);
  }
}
export function setPlaybackSpeed(speed: number): void {
  TrackPlayer.setPlaybackSpeed(speed);
}

export function getPlaybackSpeed(): number {
  return TrackPlayer.getPlaybackSpeed();
}