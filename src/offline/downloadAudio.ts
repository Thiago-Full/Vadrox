import { Platform } from 'react-native';
import ReactNativeBlobUtil, {
  type FetchBlobResponse,
} from 'react-native-blob-util';

export type DownloadAudioParams = {
  url: string;
  videoId: string;
  headers?: Record<string, string>;
  overwrite?: boolean;
  timeoutMs?: number;
  onProgress?: (received: number, total: number) => void;
  signal?: AbortSignal;
};

const TRACKS_DIR = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/tracks`;
const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;
const inFlight = new Map<string, Promise<string>>();

export function downloadAudioToDocuments(
  params: DownloadAudioParams,
): Promise<string> {
  const existing = inFlight.get(params.videoId);
  if (existing) return existing;

  const job = runDownload(params).finally(() => {
    inFlight.delete(params.videoId);
  });

  inFlight.set(params.videoId, job);
  return job;
}

async function runDownload({
  url,
  videoId,
  headers,
  overwrite = false,
  timeoutMs = 5 * 60_000,
  onProgress,
  signal,
}: DownloadAudioParams): Promise<string> {
  if (!SAFE_ID.test(videoId)) {
    throw new Error(`downloadAudio: invalid videoId "${videoId}"`);
  }
  if (signal?.aborted) throw abortError();

  await ensureTracksDir();

  const destPath = `${TRACKS_DIR}/${videoId}.${extensionFromUrl(url)}`;

  if (!overwrite && (await ReactNativeBlobUtil.fs.exists(destPath))) {
    return toFileUri(destPath);
  }

  const task = ReactNativeBlobUtil.config({
    fileCache: true,
    path: destPath,
    overwrite: true,
    timeout: timeoutMs,
    followRedirect: true,
    IOSBackgroundTask: true,
    indicator: Platform.OS === 'ios',
  }).fetch('GET', url, {
    Accept: 'audio/*,application/octet-stream',
    ...headers,
  });

  if (onProgress) {
    task.progress({ interval: 250 }, (received, total) => {
      onProgress(Number(received), Number(total));
    });
  }

  const onAbort = () => {
    task.cancel(() => {});
  };
  signal?.addEventListener('abort', onAbort, { once: true });

  try {
    const res: FetchBlobResponse = await task;
    const status = res.info()?.status ?? 0;
    const saved = res.path();

    if (status < 200 || status >= 300) {
      await unlinkQuiet(saved);
      throw new Error(`downloadAudio: HTTP ${status} for ${videoId}`);
    }

    if (Platform.OS === 'ios') {
      await ReactNativeBlobUtil.ios.excludeFromBackupKey(saved);
    }

    return toFileUri(saved);
  } catch (error) {
    await unlinkQuiet(destPath);
    if (signal?.aborted) throw abortError();
    throw error;
  } finally {
    signal?.removeEventListener('abort', onAbort);
  }
}

async function ensureTracksDir(): Promise<void> {
  if (!(await ReactNativeBlobUtil.fs.exists(TRACKS_DIR))) {
    await ReactNativeBlobUtil.fs.mkdir(TRACKS_DIR);
  }
}

function extensionFromUrl(url: string): string {
  try {
    const last = new URL(url).pathname.split('/').pop() ?? '';
    const ext = last.split('.').pop()?.toLowerCase();
    if (ext && /^[a-z0-9]{2,5}$/.test(ext)) return ext;
  } catch {
    // URL malformada ou relativa — fallback
  }
  return 'm4a';
}

function toFileUri(absolutePath: string): string {
  return absolutePath.startsWith('file://')
    ? absolutePath
    : `file://${absolutePath}`;
}

async function unlinkQuiet(path: string): Promise<void> {
  try {
    if (await ReactNativeBlobUtil.fs.exists(path)) {
      await ReactNativeBlobUtil.fs.unlink(path);
    }
  } catch {
    // partial file — best effort
  }
}

function abortError(): Error {
  const err = new Error('downloadAudio: aborted');
  err.name = 'AbortError';
  return err;
}