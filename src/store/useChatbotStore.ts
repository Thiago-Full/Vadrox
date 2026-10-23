// src/store/useChatbotStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ChatbotState {
  name: string;
  photoUrl: string;
  bubbleColor: string;
  setProfile: (p: Partial<Pick<ChatbotState, 'name' | 'photoUrl' | 'bubbleColor'>>) => void;
}

export const useChatbotStore = create<ChatbotState>()(
  persist(
    (set) => ({
      name: 'Sérgio',
      photoUrl: 'https://i.pravatar.cc/120?u=sergio-ai',
      bubbleColor: '#8B5CF6',
      setProfile: (p) => set(p),
    }),
    {
      name: 'vadrox-chatbot',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export const GREETINGS = [
  'Fala, pronto pra ouvir uma música nova',
  'O que tu quer ouvir hoje',
  'Seja bem-vindo! O Senhor Já Cedeu Esse Anus Preto Hoje',
  'Bem-vindo de volta! Sabe usar seu proprio app',
  'Olá tu ta ai? Aloou',
  'Tu Já Ouviu O Exu Marreta Pular Corda',
  'Quantas vezes você já me chamou hoje?',
  'Quantas gramas de maconha você já fumou hoje',
] as const;