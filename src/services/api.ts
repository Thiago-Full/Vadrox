// src/services/api.ts

const API_URL_RENDER = __DEV__
  ? 'http://localhost:3000'
  : 'https://vadrox-backend.onrender.com';

let tunnelUrlCache: string | null = null;
let lastFetch = 0;
const CACHE_TTL = 30000;

async function getFreshTunnel(): Promise<string | null> {
  const now = Date.now();

  if (tunnelUrlCache && now - lastFetch < CACHE_TTL) {
    return tunnelUrlCache;
  }

  try {
    const res = await fetch(`${API_URL_RENDER}/tunnel-url`);
    const data = await res.json();
    if (data?.url) {
      tunnelUrlCache = data.url;
      lastFetch = now;
      console.log('[API] Tunnel URL:', tunnelUrlCache);
      return tunnelUrlCache;
    }
    console.warn('[API] Render retornou sem URL de túnel');
  } catch (e) {
    console.warn('[API] Falha ao buscar URL do túnel:', e);
  }

  return tunnelUrlCache;
}

export async function initTunnelUrl(): Promise<void> {
  await getFreshTunnel();
}

export interface ChatResponse {
  reply: string;
  tracks: any[];
}

export const VadroxAPI = {
  search: async (query: string) => {
    try {
      const res = await fetch(`${API_URL_RENDER}/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error('Erro na busca');
      const data = await res.json();
      return data.tracks || [];
    } catch (error) {
      console.error('Falha na busca:', error);
      return [];
    }
  },

  getAudioUrl: async (videoId: string): Promise<string> => {
    let base = await getFreshTunnel();

    if (!base) {
      tunnelUrlCache = null;
      lastFetch = 0;
      base = await getFreshTunnel();
    }

    if (!base) {
      throw new Error('Túnel offline — PC precisa estar ligado');
    }

    return `${base}/stream/${videoId}`;
  },

  getStreamUrl: async (videoId: string): Promise<string> => {
    return VadroxAPI.getAudioUrl(videoId);
  },

  chat: async (
    message: string,
    history: { from: 'bot' | 'user'; text: string }[],
    context?: {
      title?: string;
      artist?: string;
      isPlaying?: boolean;
      position?: number;
      duration?: number;
    },
  ): Promise<ChatResponse> => {
    try {
      const res = await fetch(`${API_URL_RENDER}/chat/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, context }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return {
        reply: data.reply ?? '',
        tracks: data.tracks ?? [],
      };
    } catch (e) {
      console.error('[API] chat falhou:', e);
      throw e;
    }
  },
};