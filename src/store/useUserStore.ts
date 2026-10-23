// src/store/useUserStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
  name: string;
  bio: string;
  photoUrl: string;
  setProfile: (p: Partial<Pick<UserState, 'name' | 'bio' | 'photoUrl'>>) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      name: 'Maldito Do TH',
      bio: 'Mestre De todos O Pisoteador de shereka com cuturno tamanho 49.',
      photoUrl: 'https://i.pravatar.cc/200?u=vadrox',
      setProfile: (p) => set(p),
    }),
    {
      name: 'vadrox-user',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);