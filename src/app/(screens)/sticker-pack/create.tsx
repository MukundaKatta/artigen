import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useStickerPacks } from '@/hooks/useStickerPacks';
import { useStickerPack } from '@/hooks/useStickerPack';
import { StickerGrid } from '@/components/stickers/StickerGrid';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function CreateStickerPackScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { create } = useStickerPacks(user?.id);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [createdPackId, setCreatedPackId] = useState<string | null>(null);
  const [stickerUrl, setStickerUrl] = useState('');
  const [stickerLabel, setStickerLabel] = useState('');
  const [creating, setCreating] = useState(false);

  const { stickers, addSticker, removeSticker } = useStickerPack(createdPackId ?? undefined);

  const handleCreatePack = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a pack name');
      return;
    }
    setCreating(true);
    const result = await create(name.trim(), description.trim() || undefined);
    if (result?.data) {
      setCreatedPackId(result.data.id);
    } else {
      Alert.alert('Error', 'Failed to create pack');
    }
    setCreating(false);
  };

  const handleAddSticker = async () => {
    if (!stickerUrl.trim()) {
      Alert.alert('Error', 'Please enter a sticker image URL');
      return;
    }
    await addSticker(stickerUrl.trim(), stickerLabel.trim() || undefined);
    setStickerUrl('');
    setStickerLabel('');
  };

  const handleRemoveSticker = (sticker: any) => {
    Alert.alert('Remove Sticker', 'Remove this sticker from the pack?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeSticker(sticker.id) },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Create Pack' }} />

      {!createdPackId ? (
        <View style={styles.section}>
          <Input
            label="Pack Name"
            placeholder="My awesome sticker pack"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Description (optional)"
            placeholder="What's this pack about?"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={2}
          />
          <Button
            title="Create Pack"
            variant="primary"
            onPress={handleCreatePack}
            loading={creating}
            disabled={!name.trim() || creating}
            size="lg"
          />
        </View>
      ) : (
        <>
          <View style={styles.section}>
            <Text style={styles.successText}>Pack created! Now add stickers.</Text>

            <Input
              label="Sticker Image URL"
              placeholder="https://..."
              value={stickerUrl}
              onChangeText={setStickerUrl}
            />
            <Input
              label="Label (optional)"
              placeholder="happy, sad, hello..."
              value={stickerLabel}
              onChangeText={setStickerLabel}
            />
            <Button
              title="Add Sticker"
              variant="primary"
              onPress={handleAddSticker}
              disabled={!stickerUrl.trim()}
              size="md"
            />
          </View>

          {stickers.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Added Stickers ({stickers.length})
              </Text>
              <StickerGrid
                stickers={stickers}
                onLongPress={handleRemoveSticker}
              />
            </View>
          )}

          <View style={styles.section}>
            <Button
              title="Done"
              variant="outline"
              onPress={() => router.push(`/(screens)/sticker-pack/${createdPackId}`)}
              size="lg"
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.success,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
});
