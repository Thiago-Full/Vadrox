// src/components/ui/ConversationsModal.tsx
import React, { FC } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { useThemeStore } from '../../store/useThemeStore';
import { useChatStore, Conversation } from '../../store/useChatStore';
import { spacing, radius, shadows } from '../../theme/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onNewConversation: () => void;
}

const formatDate = (ts: number): string => {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'agora';
  if (min < 60) return `${min}min atrás`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h atrás`;
  const days = Math.floor(hours / 24);
  return `${days}d atrás`;
};

const ConversationsModal: FC<Props> = ({ visible, onClose, onNewConversation }) => {
  const theme = useThemeStore((s) => s.theme);
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeId);
  const setActive = useChatStore((s) => s.setActive);
  const deleteConversation = useChatStore((s) => s.deleteConversation);

  const renderItem = ({ item }: { item: Conversation }) => {
    const isActive = item.id === activeId;
    const msgCount = item.messages.filter((m) => !m.isHero).length;

    return (
      <TouchableOpacity
        onPress={() => {
          setActive(item.id);
          onClose();
        }}
        style={[
          styles.row,
          {
            backgroundColor: isActive ? theme.colors.primarySoft : 'transparent',
            borderColor: theme.colors.border,
          },
        ]}
        activeOpacity={0.7}
      >
        <View style={styles.rowInfo}>
          <Text
            numberOfLines={1}
            style={[styles.rowTitle, { color: theme.colors.text }]}
          >
            {item.title}
          </Text>
          <Text style={[styles.rowSub, { color: theme.colors.textSecondary }]}>
            {formatDate(item.updatedAt)} · {msgCount} {msgCount === 1 ? 'mensagem' : 'mensagens'}
          </Text>
        </View>

        <Pressable
          onPress={() => deleteConversation(item.id)}
          hitSlop={10}
          style={styles.trashBtn}
        >
          <Ionicons name="trash-outline" size={18} color={theme.colors.danger} />
        </Pressable>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
          ]}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={[styles.handle, { backgroundColor: theme.colors.border }]} />

          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
              Conversas
            </Text>
            <Text style={[styles.counter, { color: theme.colors.textSecondary }]}>
              {conversations.length}/10
            </Text>
          </View>

          <FlatList
            data={conversations}
            keyExtractor={(c) => c.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
            ListEmptyComponent={
              <Text style={[styles.empty, { color: theme.colors.textTertiary }]}>
                Nenhuma conversa ainda
              </Text>
            }
            style={{ maxHeight: 400, marginTop: spacing.sm }}
            showsVerticalScrollIndicator={false}
          />

          <TouchableOpacity
            onPress={() => {
              onNewConversation();
              onClose();
            }}
            style={[styles.newBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Ionicons name="add" size={20} color="#FFF" />
            <Text style={styles.newBtnText}>Nova conversa</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    borderWidth: StyleSheet.hairlineWidth,
    ...shadows.lg,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: { fontSize: 18, fontWeight: '800' },
  counter: { fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    gap: spacing.sm,
  },
  rowInfo: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 14, fontWeight: '700' },
  rowSub: { fontSize: 12 },
  trashBtn: { padding: spacing.sm },
  empty: { textAlign: 'center', paddingVertical: spacing.xl },
  newBtn: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  newBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
});

export default ConversationsModal;