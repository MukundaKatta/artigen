import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, Modal, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { Collection } from '@/types';

type Props = {
  visible: boolean;
  onClose: () => void;
  collections: Collection[];
  onSelect: (collectionId: string | null) => void;
  onCreateNew: (name: string) => void;
};

export function CollectionPicker({ visible, onClose, collections, onSelect, onCreateNew }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  function handleCreate() {
    if (newName.trim()) {
      onCreateNew(newName.trim());
      setNewName('');
      setShowCreate(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Save to Collection</Text>
          <AnimatedPressable onPress={onClose} scaleValue={0.85}>
            <Ionicons name="close" size={24} color={colors.text} />
          </AnimatedPressable>
        </View>

        {/* All Saved (unsorted) */}
        <AnimatedPressable style={styles.row} onPress={() => {
          if (Platform.OS !== 'web') Haptics.selectionAsync();
          onSelect(null); onClose();
        }} scaleValue={0.98}>
          <Ionicons name="bookmark-outline" size={24} color={colors.text} />
          <Text style={styles.rowText}>All Saved</Text>
        </AnimatedPressable>

        {/* Collections */}
        <FlatList
          data={collections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AnimatedPressable style={styles.row} onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              onSelect(item.id); onClose();
            }} scaleValue={0.98}>
              <Ionicons name="folder-outline" size={24} color={colors.text} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowText}>{item.name}</Text>
                <Text style={styles.rowCount}>{item.post_count} posts</Text>
              </View>
            </AnimatedPressable>
          )}
        />

        {/* Create New */}
        {showCreate ? (
          <View style={styles.createRow}>
            <TextInput
              style={styles.createInput}
              placeholder="Collection name"
              placeholderTextColor={colors.textSecondary}
              value={newName}
              onChangeText={setNewName}
              autoFocus
            />
            <AnimatedPressable onPress={() => {
              if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleCreate();
            }} disabled={!newName.trim()} scaleValue={0.9}>
              <Text style={[styles.createButtonText, !newName.trim() && { opacity: 0.5 }]}>Create</Text>
            </AnimatedPressable>
          </View>
        ) : (
          <AnimatedPressable style={styles.row} onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            setShowCreate(true);
          }} scaleValue={0.98}>
            <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
            <Text style={[styles.rowText, { color: colors.primary }]}>New Collection</Text>
          </AnimatedPressable>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  rowCount: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  createInput: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
  },
  createButtonText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.primary,
  },
});
