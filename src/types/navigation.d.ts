// src/types/navigation.d.ts
import type { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  Home: undefined;
  Search: undefined;
  Library: undefined;
  Profile: undefined;
};

export type DrawerParamList = {
  MainTabs: NavigatorScreenParams<BottomTabParamList> | undefined;
  History: undefined;
  Config: undefined;
  Library: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Drawer: NavigatorScreenParams<DrawerParamList> | undefined;
  Player: { trackId?: string } | undefined;
  Chatbot: undefined;
  Playlist: { playlistId: string; title: string };
  AiSuggestions: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}