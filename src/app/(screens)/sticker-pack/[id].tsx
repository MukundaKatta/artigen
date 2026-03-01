import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useStickerPack } from '@/hooks/useStickerPack';
import { useStickerPacks } from '@/hooks/useStickerPacks';
import { StickerGrid } from '@/components/stickers/StickerGrid';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

export default function StickerPackDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { pack, stickers, loading, removeSticker } = useStickerPack(id);
  const { savedPacks, savePack, unsavePack } = useStickerPacks(user?.id);

  const isSaved = savedPacks.some((p) => p.id === id);
  const isOwner = pack?.creator_id === user?.id || pack?.creator?.id === user?.id;

  const handleRemoveSticker = (sticker: any) => {
    if (!isOwner) return;
    Alert.alert('Remove Sticker', 'Are you sure you want to remove this sticker?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeSticker(sticker.id) },
    ]);
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (!pack) return <Text style={styles.error}>Pack not found</Text>;

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: pack.name }} />

      {/* Pack info */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.packName}>{pack.name}</Text>
          {pack.description ? (
            <Text style={styles.description}>{pack.description}</Text>
          ) : null}
          <Text style={styles.meta}>
            {pack.sticker_count ?? stickers.length} stickers
            {pack.creator?.username ? ` · by @${pack.creator.username}` : ''}
          </Text>
        </View>
      </View>

      {/* Save / Unsave button */}
      {!isOwner && (
        <View style={styles.actionRow}>
          <Button
            title={isSaved ? 'Saved' : 'Save Pack'}
            variant={isSaved ? 'outline' : 'primary'}
            onPress={() => {
              if (isSaved) {
                unsavePack(pack.id);
              } else {
                savePack(pack.id);
              }
            }}
            size="md"
            style={styles.saveButton}
          />
        </View>
      )}

      {/* Sticker grid */}
      <Text style={styles.sectionTitle}>Stickers</Text>
      <StickerGrid
        stickers={stickers}
        onLongPress={isOwner ? handleRemoveSticker : undefined}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerInfo: {
    gap: spacing.xs,
  },
  packName: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    color: colors.text,
  },
  description: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  meta: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  actionRow: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  saveButton: {
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  error: {
    flex: 1,
    textAlign: 'center',
    color: colors.error,
    marginTop: 60,
    fontSize: fontSize.md,
  },
});
