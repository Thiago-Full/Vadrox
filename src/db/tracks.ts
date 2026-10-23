import {
  open,
  NitroSQLiteError,
  type NitroSQLiteConnection,
} from 'react-native-nitro-sqlite';

export type Track = {
  id: number;
  videoId: string;
  title: string;
  artist: string;
  audio_path: string;
  duration: number; // ms
};

export type NewTrack = Omit<Track, 'id'>;

const DB_NAME = 'offline-music.sqlite';

const CREATE_TRACKS_SQL = `
  CREATE TABLE IF NOT EXISTS tracks (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    videoId    TEXT    NOT NULL UNIQUE,
    title      TEXT    NOT NULL,
    artist     TEXT    NOT NULL,
    audio_path TEXT    NOT NULL,
    duration   INTEGER NOT NULL DEFAULT 0 CHECK (duration >= 0)
  ) STRICT;
`;

let boot: Promise<NitroSQLiteConnection> | null = null;

export function initDatabase(): Promise<NitroSQLiteConnection> {
  if (boot) return boot;

  boot = (async () => {
    const db = open({ name: DB_NAME });

    // WAL fora de transação — journal_mode não pode ir no executeBatch.
    await db.executeAsync('PRAGMA journal_mode = WAL');
    await db.executeAsync('PRAGMA synchronous = NORMAL');
    await db.executeAsync('PRAGMA busy_timeout = 5000');
    await db.executeAsync('PRAGMA temp_store = MEMORY');
    await db.executeAsync('PRAGMA foreign_keys = ON');
    await db.executeAsync(CREATE_TRACKS_SQL);

    return db;
  })().catch((error) => {
    boot = null;
    throw error instanceof NitroSQLiteError
      ? error
      : new NitroSQLiteError(String(error));
  });

  return boot;
}

export async function upsertTrack(track: NewTrack): Promise<number> {
  const db = await initDatabase();

  const { insertId } = await db.executeAsync(
    `
      INSERT INTO tracks (videoId, title, artist, audio_path, duration)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(videoId) DO UPDATE SET
        title      = excluded.title,
        artist     = excluded.artist,
        audio_path = excluded.audio_path,
        duration   = excluded.duration
      RETURNING id;
    `,
    [track.videoId, track.title, track.artist, track.audio_path, track.duration],
  );

  if (insertId == null) {
    const { results } = await db.executeAsync<{ id: number }>(
      'SELECT id FROM tracks WHERE videoId = ? LIMIT 1',
      [track.videoId],
    );
    const id = results[0]?.id;
    if (id == null) throw new Error(`upsertTrack: row missing for ${track.videoId}`);
    return id;
  }

  return insertId;
}

export async function getTrackByVideoId(
  videoId: string,
): Promise<Track | null> {
  const db = await initDatabase();
  const { results } = await db.executeAsync<Track>(
    'SELECT id, videoId, title, artist, audio_path, duration FROM tracks WHERE videoId = ? LIMIT 1',
    [videoId],
  );
  return results[0] ?? null;
}