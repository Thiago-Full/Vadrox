// src/components/ui/DevPanel.tsx
import React, { FC, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useThemeStore } from '../../store/useThemeStore';
import { useDownloadStore } from '../../store/useDownloadStore';
import { useFavoritesStore } from '../../store/useFavoritesStore';
import { usePlaylistStore } from '../../store/usePlaylistStore';
import { useAiSuggestionsStore } from '../../store/useAiSuggestionsStore';
import { spacing, radius } from '../../theme/theme';

const RENDER_URL = 'https://vadrox-backend.onrender.com';

type Status = 'checking' | 'online' | 'offline';

const StatusRow: FC<{
  label: string;
  status: Status;
  latency?: number;
  detail?: string;
}> = ({ label, status, latency, detail }) => {
  const theme = useThemeStore((s) => s.theme);

  return (
    <View style={[styles.row, { borderColor: theme.colors.border }]}>
      <Text style={[styles.rowLabel, { color: theme.colors.text }]}>{label}</Text>
      <View style={styles.statusBadge}>
        {status === 'checking' && (
          <ActivityIndicator size="small" color={theme.colors.primary} />
        )}
        {status === 'online' && (
          <>
            <View style={[styles.dot, { backgroundColor: '#22C55E' }]} />
            <Text style={[styles.statusText, { color: theme.colors.text }]}>
              Online{latency ? ` · ${latency}ms` : ''}
            </Text>
          </>
        )}
        {status === 'offline' && (
          <>
            <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
            <Text style={[styles.statusText, { color: theme.colors.danger }]}>
              Offline
            </Text>
          </>
        )}
      </View>
      {detail ? (
        <Text
          numberOfLines={1}
          style={[styles.detail, { color: theme.colors.textTertiary }]}
        >
          {detail}
        </Text>
      ) : null}
    </View>
  );
};

const DevPanel: FC = () => {
  const theme = useThemeStore((s) => s.theme);
  const downloads = useDownloadStore((s) => s.downloads);
  const favorites = useFavoritesStore((s) => s.favorites);
  const playlists = usePlaylistStore((s) => s.playlists);
  const suggestions = useAiSuggestionsStore((s) => s.suggestions);

  const [renderStatus, setRenderStatus] = useState<Status>('checking');
  const [renderLatency, setRenderLatency] = useState(0);

  const [tunnelStatus, setTunnelStatus] = useState<Status>('checking');
  const [tunnelLatency, setTunnelLatency] = useState(0);
  const [tunnelUrl, setTunnelUrl] = useState<string>('');

  const [lastCheck, setLastCheck] = useState<string>('');

  const ping = async (
    url: string,
    timeoutMs = 6000,
  ): Promise<{ ok: boolean; latency: number }> => {
    const t0 = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(`${url}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      return { ok: res.ok, latency: Date.now() - t0 };
    } catch {
      return { ok: false, latency: 0 };
    }
  };

  const runChecks = async () => {
    setRenderStatus('checking');
    setTunnelStatus('checking');
    setLastCheck(new Date().toLocaleTimeString('pt-BR'));

    // 1. Testa Render
    const r = await ping(RENDER_URL);
    setRenderStatus(r.ok ? 'online' : 'offline');
    setRenderLatency(r.latency);

    // 2. Pega URL do túnel publicada no Render
    let currentTunnelUrl = '';
    try {
      const res = await fetch(`${RENDER_URL}/tunnel-url`);
      const data = await res.json();
      currentTunnelUrl = data?.url ?? '';
      setTunnelUrl(currentTunnelUrl);
    } catch {
      setTunnelUrl('');
    }

    // 3. Se achou URL, testa ela
    if (currentTunnelUrl) {
      const t = await ping(currentTunnelUrl);
      setTunnelStatus(t.ok ? 'online' : 'offline');
      setTunnelLatency(t.latency);
    } else {
      setTunnelStatus('offline');
    }
  };

  useEffect(() => {
    runChecks();
  }, []);

  const color = theme.colors.text;

  return (
    <View style={{ gap: spacing.sm }}>
      <StatusRow
        label="🌐 Render (busca + chat)"
        status={renderStatus}
        latency={renderLatency}
      />

      <StatusRow
        label="💻 Túnel do PC (stream)"
        status={tunnelStatus}
        latency={tunnelLatency}
        detail={tunnelUrl ? tunnelUrl.replace('https://', '').split('.')[0] + '...' : undefined}
      />

      <TouchableOpacity
        onPress={runChecks}
        style={[
          styles.refreshBtn,
          { borderColor: theme.colors.primary, backgroundColor: theme.colors.primarySoft },
        ]}
        activeOpacity={0.7}
      >
        <Ionicons name="refresh" size={16} color={theme.colors.primary} />
        <Text style={[styles.refreshText, { color: theme.colors.primary }]}>
          Atualizar status
        </Text>
      </TouchableOpacity>

      {lastCheck ? (
        <Text style={[styles.lastCheck, { color: theme.colors.textTertiary }]}>
          Última verificação: {lastCheck}
        </Text>
      ) : null}

      <View style={[styles.statsBox, { borderColor: theme.colors.border }]}>
        <Text style={[styles.statsTitle, { color: theme.colors.textSecondary }]}>
          Dados locais
        </Text>
        <Text style={[styles.statLine, { color }]}>
          📥 Downloads: {Object.keys(downloads).length}
        </Text>
        <Text style={[styles.statLine, { color }]}>
          ❤️ Favoritos: {favorites.length}
        </Text>
        <Text style={[styles.statLine, { color }]}>
          🎵 Playlists: {playlists.length}
        </Text>
        <Text style={[styles.statLine, { color }]}>
          🤖 Sugestões IA: {suggestions.length}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    flexWrap: 'wrap',
    gap: 4,
  },
  rowLabel: { fontSize: 13, fontWeight: '600' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '600' },
  detail: {
    fontSize: 10,
    width: '100%',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  refreshText: { fontSize: 13, fontWeight: '700' },
  lastCheck: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: -4,
  },
  statsBox: {
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  statsTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statLine: { fontSize: 13 },
});

export default DevPanel;