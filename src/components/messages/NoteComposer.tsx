import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import { logger } from '@/lib/logger';

const MAX_NOTE_LENGTH = 60;

const EMOJI_OPTIONS = ['', '😊', '🎨', '🔥', '💡', '✨', '🚀', '🎵', '❤️', '🌙'];

type Props = {
  visible: boolean;
  onClose: () => void;
  onShare: (content: string, emoji?: string) => Promise<void>;
};

export function NoteComposer({ visible, onClose, onShare }: Props) {
  const [content, setContent] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('');
  const [sharing, setSharing] = useState(false);

  const canShare = content.trim().length > 0 && content.length <= MAX_NOTE_LENGTH;

  async function handleShare() {
    if (!canShare || sharing) return;
    try {
      setSharing(true);
      await onShare(content.trim(), selectedEmoji || undefined);
      setContent('');
      setSelectedEmoji('');
    } catch (error) {
      logger.error('Failed to share note:', error);
    } finally {
      setSharing(false);
    }
  }

  function handleClose() {
    setContent('');
    setSelectedEmoji('');
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Cancel note"
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title} accessibilityRole="header">New note</Text>
            <TouchableOpacity
              onPress={handleShare}
              disabled={!canShare || sharing}
              accessibilityRole="button"
              accessibilityLabel="Share note"
              accessibilityState={{ disabled: !canShare || sharing, busy: sharing }}
            >
              <Text
                style={[
                  styles.shareText,
                  (!canShare || sharing) && styles.shareDisabled,
                ]}
              >
                Share
              </Text>
            </TouchableOpacity>
          </View>

          {/* Preview bubble */}
          <View style={styles.preview}>
            <View style={styles.previewBubble}>
              <Text style={styles.previewText}>
                {selectedEmoji ? `${selectedEmoji} ` : ''}
                {content || 'Share a thought...'}
              </Text>
            </View>
          </View>

          {/* Input */}
          <TextInput
            style={styles.input}
            value={content}
            onChangeText={setContent}
            placeholder="Share a thought..."
            placeholderTextColor={colors.textSecondary}
            maxLength={MAX_NOTE_LENGTH}
            multiline={false}
            autoFocus
            accessibilityLabel="Note text"
            accessibilityHint={`Up to ${MAX_NOTE_LENGTH} characters`}
          />

          {/* Character count */}
          <Text
            style={[
              styles.charCount,
              content.length > MAX_NOTE_LENGTH - 10 && styles.charCountWarning,
            ]}
          >
            {content.length}/{MAX_NOTE_LENGTH}
          </Text>

          {/* Emoji picker row */}
          <View style={styles.emojiRow} accessibilityRole="radiogroup" accessibilityLabel="Note emoji">
            {EMOJI_OPTIONS.map((emoji) => (
              <TouchableOpacity
                key={emoji || 'none'}
                style={[
                  styles.emojiOption,
                  selectedEmoji === emoji && styles.emojiSelected,
                ]}
                onPress={() => setSelectedEmoji(emoji)}
                accessibilityRole="radio"
                accessibilityLabel={emoji ? `Emoji ${emoji}` : 'No emoji'}
                accessibilityState={{ selected: selectedEmoji === emoji }}
              >
                {emoji ? (
                  <Text style={styles.emojiText}>{emoji}</Text>
                ) : (
                  <Ionicons
                    name="close-circle-outline"
                    size={20}
                    color={
                      selectedEmoji === '' ? colors.primary : colors.textSecondary
                    }
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cancelText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  shareText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.primary,
  },
  shareDisabled: {
    opacity: 0.4,
  },
  preview: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  previewBubble: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    maxWidth: '70%',
  },
  previewText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    textAlign: 'center',
  },
  input: {
    fontSize: fontSize.lg,
    fontFamily: typography.regular,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  charCount: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'right',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
  },
  charCountWarning: {
    color: colors.warning,
  },
  emojiRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.sm,
    justifyContent: 'center',
  },
  emojiOption: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSecondary,
  },
  emojiSelected: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  emojiText: {
    fontSize: fontSize.lg,
  },
});
