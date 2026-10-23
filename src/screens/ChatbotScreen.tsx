// src/screens/ChatbotScreen.tsx
import React, { FC, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { useThemeStore } from '../store/useThemeStore';
import { useChatbotStore, GREETINGS } from '../store/useChatbotStore';
import { useUserStore } from '../store/useUserStore';
import { usePlayerStore, Track } from '../store/usePlayerStore';
import { useChatStore, chatUid, ChatMsg } from '../store/useChatStore';
import { useAiSuggestionsStore } from '../store/useAiSuggestionsStore';
import { spacing, radius, shadows } from '../theme/theme';
import GradientBackground from '../components/ui/GradientBackground';
import MusicListItem from '../components/MusicListItem';
import ConversationsModal from '../components/ui/ConversationsModal';
import { VadroxAPI } from '../services/api';

const randomGreeting = (userName: string) => {
  const g = GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
  return `${g}, ${userName.split(' ')[0]}?`;
};

// ─── Componente AnimatedTracksBox ───
const AnimatedTracksBox: FC<{
  tracks: any[];
  animate: boolean;
  onPress: (t: any) => void;
  onComplete: () => void;
}> = ({ tracks, animate, onPress, onComplete }) => {
  const theme = useThemeStore((s) => s.theme);
  const [visibleCount, setVisibleCount] = useState(animate ? 0 : tracks.length);

  useEffect(() => {
    if (!animate) {
      setVisibleCount(tracks.length);
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      i++;
      if (i >= tracks.length) {
        setVisibleCount(tracks.length);
        clearInterval(interval);
        onComplete();
      } else {
        setVisibleCount(i);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [animate, tracks.length]);

  return (
    <View
      style={[
        styles.tracksBox,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
    >
      {tracks.slice(0, visibleCount).map((t) => (
        <MusicListItem key={t.id} track={t} onPress={onPress} />
      ))}
    </View>
  );
};


// ─── Componente Typewriter ───
const TypewriterText: FC<{
  text: string;
  animate: boolean;
  style: any;
  onComplete?: () => void;
}> = ({ text, animate, style, onComplete }) => {
  const [displayed, setDisplayed] = useState(animate ? '' : text);

  useEffect(() => {
    if (!animate) {
      setDisplayed(text);
      return;
    }

    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      i++;
      if (i >= text.length) {
        setDisplayed(text);
        clearInterval(interval);
        onComplete?.();
      } else {
        setDisplayed(text.slice(0, i));
      }
    }, 20);

    return () => clearInterval(interval);
  }, [text, animate]);

  return <Text style={style}>{displayed}</Text>;
};

const ChatbotScreen: FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const theme = useThemeStore((s) => s.theme);
  const { name, photoUrl } = useChatbotStore();
  const { name: userName, photoUrl: userPhotoUrl } = useUserStore();

  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const play = usePlayerStore((s) => s.play);

  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeId);
  const createConversation = useChatStore((s) => s.createConversation);
  const setActive = useChatStore((s) => s.setActive);
  const addMessage = useChatStore((s) => s.addMessage);
  const replaceMessage = useChatStore((s) => s.replaceMessage);

  const addSuggestions = useAiSuggestionsStore((s) => s.addSuggestions);

  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<ScrollView>(null);

  const activeConv = conversations.find((c) => c.id === activeId) ?? null;
  const messages = activeConv?.messages ?? [];

  useEffect(() => {
    if (!activeId && conversations.length === 0) {
      createConversation(randomGreeting(userName));
    } else if (!activeId && conversations.length > 0) {
      setActive(conversations[0].id);
    }
  }, [activeId, conversations.length, userName]);

  const handleNewConversation = () => {
    createConversation(randomGreeting(userName));
  };

  const send = async () => {
    const text = input.trim();
    if (!text || sending || !activeId) return;

    setInput('');
    const userMsg: ChatMsg = { id: chatUid(), from: 'user', text };
    const thinkingMsg: ChatMsg = {
      id: chatUid(),
      from: 'bot',
      text: 'Pensando...',
      thinking: true,
    };

    addMessage(userMsg);
    addMessage(thinkingMsg);
    setSending(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const history = messages
      .filter((m) => !m.isHero && !m.thinking && !m.error && m.text)
      .map((m) => ({ from: m.from, text: m.text! }));

    try {
      const result = await VadroxAPI.chat(text, history, {
        title: currentTrack?.title,
        artist: currentTrack?.artist,
        isPlaying,
        position,
        duration,
      });

      setAnimatingIds((s) => {
  const next = new Set(s);
  next.add(thinkingMsg.id);
  next.add(thinkingMsg.id + '-tracks');
  return next;
});

      replaceMessage(thinkingMsg.id, {
        text: result.reply,
        thinking: false,
        tracks: result.tracks,
      });

      if (result.tracks && result.tracks.length > 0) {
        addSuggestions(result.tracks);
      }
    } catch {
      replaceMessage(thinkingMsg.id, {
        text: 'Deu ruim aqui. Tenta de novo?',
        thinking: false,
        error: true,
      });
    } finally {
      setSending(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  const handlePlayFromChat = async (clicked: Track, queue: Track[]) => {
    try {
      const slice = queue.slice(0, 3);
      const withUrls = await Promise.all(
        slice.map(async (r) => {
          const url = await VadroxAPI.getAudioUrl(r.id);
          return url ? { ...r, url } : null;
        }),
      );
      const valid = withUrls.filter((t): t is any => t !== null);
      const clickedValid = valid.find((t) => t.id === clicked.id) ?? valid[0];
      if (clickedValid) play(clickedValid, valid);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <GradientBackground height={300} colors={theme.colors.gradientHeader} />

      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={theme.colors.text} />
          </Pressable>

          <View style={styles.headerCenter}>
            <Ionicons
              name={theme.presetIcon as any}
              size={16}
              color={theme.colors.primary}
            />
            <Text style={[styles.headerName, { color: theme.colors.text }]}>
              {name}
            </Text>
          </View>

          <View style={styles.headerRight}>
            <Pressable onPress={() => setListOpen(true)} hitSlop={10}>
              <Ionicons name="list" size={22} color={theme.colors.text} />
            </Pressable>
            <Pressable onPress={handleNewConversation} hitSlop={10}>
              <Ionicons name="add" size={24} color={theme.colors.text} />
            </Pressable>
          </View>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: false })
            }
          >
            {messages.map((m) => {
              if (m.isHero) {
                return (
                  <View key={m.id} style={styles.heroBlock}>
                    <Text
                      style={[
                        styles.heroText,
                        {
                          color: theme.colors.primary,
                          textShadowColor: theme.colors.primary,
                          textShadowOffset: { width: 0, height: 0 },
                          textShadowRadius: 24,
                        },
                      ]}
                    >
                      {m.text}
                    </Text>
                    <Text style={[styles.heroHint, { color: theme.colors.textSecondary }]}>
                      Pergunte algo sobre música
                    </Text>
                  </View>
                );
              }

              const isBot = m.from === 'bot';
              const shouldAnimate = isBot && animatingIds.has(m.id);
              const bs = theme.colors.bubbleStyle;
              const isGlow = bs.glow;

              return (
                <View key={m.id} style={{ marginBottom: spacing.md }}>
                  <View style={[styles.msgRow, isBot ? styles.rowLeft : styles.rowRight]}>
                    {isBot && <Image source={{ uri: photoUrl }} style={styles.avatar} />}

                    <View
                      style={[
                        styles.bubble,
                        isBot
                          ? {
                              backgroundColor: theme.colors.surface,
                              borderColor: m.error ? theme.colors.danger : theme.colors.border,
                              borderWidth: m.error ? 1 : 0,
                              borderTopLeftRadius: 20,
                              borderTopRightRadius: 20,
                              borderBottomLeftRadius: 20,
                              borderBottomRightRadius: 20,
                            }
                          : {
                              backgroundColor: theme.colors.bubbleColor,
                              borderColor: theme.colors.primary,
                              borderWidth: bs.borderWidth,
                              borderTopLeftRadius: bs.topLeft,
                              borderTopRightRadius: bs.topRight,
                              borderBottomLeftRadius: bs.bottomLeft,
                              borderBottomRightRadius: bs.bottomRight,
                              shadowColor: isGlow ? theme.colors.primary : 'transparent',
                              shadowOffset: { width: 0, height: 0 },
                              shadowOpacity: isGlow ? 0.9 : 0,
                              shadowRadius: isGlow ? 10 : 0,
                              elevation: isGlow ? 8 : 0,
                            },
                      ]}
                    >
                      {m.thinking ? (
                        <View style={styles.thinkingRow}>
                          <ActivityIndicator size="small" color={theme.colors.primary} />
                          <Text
                            style={[styles.bubbleText, { color: theme.colors.textSecondary }]}
                          >
                            {name} tá pensando...
                          </Text>
                        </View>
                      ) : (
                        <TypewriterText
                          text={m.text ?? ''}
                          animate={shouldAnimate}
                          style={[
                            styles.bubbleText,
                            {
                              color: isBot
                                ? theme.colors.text
                                : bs.lightText
                                ? '#0B0B0F'
                                : '#FFF',
                            },
                          ]}
                          onComplete={() => {
                            setAnimatingIds((s) => {
                              const next = new Set(s);
                              next.delete(m.id);
                              return next;
                            });
                            setTimeout(
                              () => scrollRef.current?.scrollToEnd({ animated: true }),
                              50,
                            );
                          }}
                        />
                      )}
                    </View>

                    {!isBot && (
                      <Image source={{ uri: userPhotoUrl }} style={styles.avatar} />
                    )}
                  </View>

                  {m.tracks && m.tracks.length > 0 ? (
  <AnimatedTracksBox
    tracks={m.tracks.slice(0, 3)}
    animate={animatingIds.has(m.id + '-tracks')}
    onPress={(t) => handlePlayFromChat(t, m.tracks!)}
    onComplete={() => {
      setAnimatingIds((s) => {
        const next = new Set(s);
        next.delete(m.id + '-tracks');
        return next;
      });
    }}
  />
) : null}
                </View>
              );
            })}
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                backgroundColor: theme.colors.background,
                borderTopColor: theme.colors.border,
                paddingBottom: insets.bottom + spacing.sm,
              },
            ]}
          >
            <Pressable
              hitSlop={10}
              style={styles.attachBtn}
              onPress={() =>
                Alert.alert(
                  'Anexar arquivo',
                  'Em breve você vai poder enviar áudio, imagem ou PDF.',
                  [{ text: 'OK' }],
                )
              }
            >
              <Ionicons name="attach" size={22} color={theme.colors.textSecondary} />
            </Pressable>

            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Pergunte algo..."
              placeholderTextColor={theme.colors.textTertiary}
              editable={!sending}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.border,
                },
              ]}
              onSubmitEditing={send}
              returnKeyType="send"
            />

            <Pressable
              onPress={send}
              disabled={sending || !input.trim()}
              style={[
                styles.sendBtn,
                {
                  backgroundColor: sending ? theme.colors.surface : theme.colors.primary,
                },
                shadows.sm,
              ]}
            >
              <Ionicons name="send" size={18} color="#FFF" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <ConversationsModal
        visible={listOpen}
        onClose={() => setListOpen(false)}
        onNewConversation={handleNewConversation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
    justifyContent: 'center',
  },
  headerName: { fontSize: 16, fontWeight: '700' },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  chatContent: { padding: spacing.lg, paddingBottom: spacing.xl },
  heroBlock: { alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.md },
  heroText: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.3,
    paddingHorizontal: spacing.lg,
  },
  heroHint: { fontSize: 13, textAlign: 'center', marginTop: spacing.sm },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#333' },
  bubble: {
    maxWidth: '76%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  thinkingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  tracksBox: {
    marginTop: spacing.sm,
    marginLeft: 40,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  attachBtn: { padding: spacing.xs },
  input: {
    flex: 1,
    height: 44,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 14,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatbotScreen;