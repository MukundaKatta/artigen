import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Avatar } from '@/components/ui/Avatar';
import { NoteComposer } from '@/components/messages/NoteComposer';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { NoteWithUser } from '@/services/notes.service';
import type { UserNote, Profile } from '@/types';

type Props = {
  myNote: UserNote | null;
  notes: NoteWithUser[];
  currentUser: Pick<Profile, 'id' | 'username' | 'avatar_url'>;
  onShareNote: (content: string, emoji?: string) => Promise<UserNote | null>;
  onDeleteNote: () => Promise<{ error: any } | undefined>;
};

export function NotesRow({
  myNote,
  notes,
  currentUser,
  onShareNote,
  onDeleteNote,
}: Props) {
  const [composerVisible, setComposerVisible] = useState(false);

  function handleOwnNoteTap() {
    if (myNote) {
      Alert.alert('Your note', myNote.content, [
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteNote() },
        { text: 'New note', onPress: () => setComposerVisible(true) },
        { text: 'Cancel', style: 'cancel' },
      ]);
    } else {
      setComposerVisible(true);
    }
  }

  function handleOtherNoteTap(note: NoteWithUser) {
    Alert.alert(
      note.user.username,
      `${note.emoji ? note.emoji + ' ' : ''}${note.content}`,
      [{ text: 'OK' }]
    );
  }

  async function handleShare(content: string, emoji?: string) {
    await onShareNote(content, emoji);
    setComposerVisible(false);
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Current user's note bubble */}
        <TouchableOpacity style={styles.noteItem} onPress={handleOwnNoteTap}>
          <View style={styles.bubbleWrapper}>
            {myNote ? (
              <View style={styles.noteBubble}>
                <Text style={styles.noteText} numberOfLines={2}>
                  {myNote.emoji ? `${myNote.emoji} ` : ''}{myNote.content}
                </Text>
              </View>
            ) : (
              <View style={[styles.noteBubble, styles.emptyBubble]}>
                <Ionicons name="add" size={14} color={colors.primary} />
              </View>
            )}
            <View style={styles.bubbleTail} />
          </View>
          <Avatar uri={currentUser.avatar_url} size="md" />
          <Text style={styles.username} numberOfLines={1}>Your note</Text>
        </TouchableOpacity>

        {/* Following users' notes */}
        {notes.map((note) => (
          <TouchableOpacity
            key={note.id}
            style={styles.noteItem}
            onPress={() => handleOtherNoteTap(note)}
          >
            <View style={styles.bubbleWrapper}>
              <View style={styles.noteBubble}>
                <Text style={styles.noteText} numberOfLines={2}>
                  {note.emoji ? `${note.emoji} ` : ''}{note.content}
                </Text>
              </View>
              <View style={styles.bubbleTail} />
            </View>
            <Avatar uri={note.user.avatar_url} size="md" />
            <Text style={styles.username} numberOfLines={1}>{note.user.username}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <NoteComposer
        visible={composerVisible}
        onClose={() => setComposerVisible(false)}
        onShare={handleShare}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.lg,
  },
  noteItem: {
    alignItems: 'center',
    width: 72,
  },
  bubbleWrapper: {
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  noteBubble: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    maxWidth: 72,
    minHeight: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyBubble: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  bubbleTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.backgroundSecondary,
  },
  noteText: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.text,
    textAlign: 'center',
  },
  username: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
});
