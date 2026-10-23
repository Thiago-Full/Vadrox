// src/store/useChatStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Track } from './usePlayerStore';

export interface ChatMsg {
  id: string;
  from: 'bot' | 'user';
  text?: string;
  tracks?: Track[];
  isHero?: boolean;
  thinking?: boolean;
  error?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMsg[];
  createdAt: number;
  updatedAt: number;
}

const MAX_CONVERSATIONS = 10;

interface ChatState {
  conversations: Conversation[];
  activeId: string | null;

  // Ações
  createConversation: (greeting: string) => string;
  setActive: (id: string) => void;
  deleteConversation: (id: string) => void;
  clearAll: () => void;

  // Ações de mensagem (na conversa ativa)
  addMessage: (msg: ChatMsg) => void;
  replaceMessage: (msgId: string, updater: Partial<ChatMsg>) => void;

  // Helpers
  getActive: () => Conversation | null;
}

export const chatUid = () => Math.random().toString(36).slice(2);

const makeTitle = (text?: string): string => {
  if (!text) return 'Nova conversa';
  const clean = text.trim();
  if (clean.length <= 30) return clean;
  return clean.slice(0, 30).trim() + '...';
};

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeId: null,

      createConversation: (greeting) => {
        const id = chatUid();
        const now = Date.now();
        const conv: Conversation = {
          id,
          title: 'Nova conversa',
          messages: [
            {
              id: chatUid(),
              from: 'bot',
              text: greeting,
              isHero: true,
            },
          ],
          createdAt: now,
          updatedAt: now,
        };

        set((s) => {
          let list = [conv, ...s.conversations];
          // Limite: remove a mais antiga se passar
          if (list.length > MAX_CONVERSATIONS) {
            list = list
              .slice()
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .slice(0, MAX_CONVERSATIONS);
          }
          return { conversations: list, activeId: id };
        });

        return id;
      },

      setActive: (id) => set({ activeId: id }),

      deleteConversation: (id) =>
        set((s) => {
          const remaining = s.conversations.filter((c) => c.id !== id);
          const nextActive =
            s.activeId === id ? remaining[0]?.id ?? null : s.activeId;
          return { conversations: remaining, activeId: nextActive };
        }),

      clearAll: () => set({ conversations: [], activeId: null }),

      addMessage: (msg) =>
        set((s) => {
          const { activeId, conversations } = s;
          if (!activeId) return s;
          return {
            conversations: conversations.map((c) => {
              if (c.id !== activeId) return c;
              const updatedMessages = [...c.messages, msg];
              // Atualiza o título se for a primeira mensagem de user
              const userMsgCount = updatedMessages.filter((m) => m.from === 'user').length;
              const newTitle =
                userMsgCount === 1 && msg.from === 'user'
                  ? makeTitle(msg.text)
                  : c.title;
              return {
                ...c,
                messages: updatedMessages,
                title: newTitle,
                updatedAt: Date.now(),
              };
            }),
          };
        }),

      replaceMessage: (msgId, updater) =>
        set((s) => {
          const { activeId, conversations } = s;
          if (!activeId) return s;
          return {
            conversations: conversations.map((c) => {
              if (c.id !== activeId) return c;
              return {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === msgId ? { ...m, ...updater } : m,
                ),
                updatedAt: Date.now(),
              };
            }),
          };
        }),

      getActive: () => {
        const { conversations, activeId } = get();
        if (!activeId) return null;
        return conversations.find((c) => c.id === activeId) ?? null;
      },
    }),
    {
      name: 'vadrox-chat-v2',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);