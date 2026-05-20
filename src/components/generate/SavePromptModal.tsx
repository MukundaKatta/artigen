import React from 'react';
import { View, Text, StyleSheet, Modal, TextInput, Switch } from 'react-native';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  visible: boolean;
  title: string;
  isPublic: boolean;
  onTitleChange: (text: string) => void;
  onPublicChange: (value: boolean) => void;
  onCancel: () => void;
  onSave: () => void;
};

export function SavePromptModal({
  visible,
  title,
  isPublic,
  onTitleChange,
  onPublicChange,
  onCancel,
  onSave,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View
          style={styles.modalContent}
          accessibilityViewIsModal
          accessibilityRole="alert"
          accessibilityLabel="Save prompt dialog"
        >
          <Text style={styles.modalTitle} accessibilityRole="header">Save Prompt</Text>
          <TextInput
            style={[styles.input, styles.modalInput]}
            placeholder="Title (optional)"
            value={title}
            onChangeText={onTitleChange}
            accessibilityLabel="Prompt title"
            accessibilityHint="Optional name for this saved prompt"
          />
          <View style={styles.switchRow}>
            <Text style={styles.modalLabel} nativeID="save-prompt-public-label">Public</Text>
            <Switch
              value={isPublic}
              onValueChange={onPublicChange}
              accessibilityLabel="Make prompt public"
              accessibilityLabelledBy="save-prompt-public-label"
              accessibilityRole="switch"
              accessibilityState={{ checked: isPublic }}
            />
          </View>
          <View style={styles.modalButtons}>
            <Button title="Cancel" variant="outline" onPress={onCancel} />
            <Button title="Save" onPress={onSave} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    marginBottom: spacing.md,
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    backgroundColor: colors.backgroundSecondary,
  },
  modalInput: {
    marginBottom: spacing.md,
  },
  modalLabel: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.text,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
});
