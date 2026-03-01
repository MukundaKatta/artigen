import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAvatarGenerator } from '@/hooks/useAvatarGenerator';
import { AvatarStylePicker } from '@/components/avatars/AvatarStylePicker';
import { AvatarGrid } from '@/components/avatars/AvatarGrid';
import { AvatarPreview } from '@/components/avatars/AvatarPreview';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { UserAvatar } from '@/services/avatar.service';

const SCREEN_WIDTH = Dimensions.get('window').width;
const THUMB_SIZE = 80;

// TODO: Replace with real auth hook
const MOCK_USER_ID = 'current-user-id';

export default function AvatarGeneratorScreen() {
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [previewAvatar, setPreviewAvatar] = useState<UserAvatar | null>(null);

  const {
    job,
    avatars,
    loading,
    loadingAvatars,
    selectedStyle,
    setSelectedStyle,
    generate,
    saveAvatar,
    setActive,
    remove,
  } = useAvatarGenerator(MOCK_USER_ID);

  // ── Pick selfie photos ─────────────────────────────

  const pickPhotos = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 3,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setSelectedPhotos(result.assets.map((a) => a.uri).slice(0, 3));
    }
  }, []);

  const removePhoto = useCallback((index: number) => {
    setSelectedPhotos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Generate ───────────────────────────────────────

  const handleGenerate = useCallback(async () => {
    if (selectedPhotos.length === 0) {
      Alert.alert('No Photos', 'Please select 1-3 selfie photos to generate your avatar.');
      return;
    }
    await generate(selectedPhotos);
  }, [selectedPhotos, generate]);

  // ── Save avatar from job result ────────────────────

  const handleSaveFromResult = useCallback(
    async (imageUrl: string) => {
      const saved = await saveAvatar(imageUrl);
      if (saved) {
        Alert.alert('Saved', 'Avatar added to your collection!');
      }
    },
    [saveAvatar],
  );

  // ── Set as profile avatar ──────────────────────────

  const handleSetActive = useCallback(
    async (avatarId: string) => {
      const result = await setActive(avatarId);
      if (result) {
        Alert.alert('Updated', 'Your profile avatar has been updated!');
        setPreviewAvatar(null);
      }
    },
    [setActive],
  );

  // ── Remove avatar ─────────────────────────────────

  const handleRemove = useCallback(
    async (avatarId: string) => {
      Alert.alert('Remove Avatar', 'Are you sure you want to remove this avatar?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await remove(avatarId);
            setPreviewAvatar(null);
          },
        },
      ]);
    },
    [remove],
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Section: Select Photos */}
      <Text style={styles.heading}>AI Avatar Generator</Text>
      <Text style={styles.subtitle}>
        Upload 1-3 selfies and choose a style to generate unique AI avatars.
      </Text>

      {/* Photo picker */}
      <View style={styles.photoSection}>
        <Text style={styles.sectionTitle}>Your Photos</Text>
        <View style={styles.photoRow}>
          {selectedPhotos.map((uri, index) => (
            <View key={index} style={styles.photoThumb}>
              <Image source={{ uri }} style={styles.photoImage} contentFit="cover" />
              <TouchableOpacity
                style={styles.removePhotoBtn}
                onPress={() => removePhoto(index)}
              >
                <Ionicons name="close-circle" size={22} color={colors.error} />
              </TouchableOpacity>
            </View>
          ))}
          {selectedPhotos.length < 3 && (
            <TouchableOpacity style={styles.addPhotoBtn} onPress={pickPhotos} activeOpacity={0.7}>
              <Ionicons name="add" size={28} color={colors.textSecondary} />
              <Text style={styles.addPhotoText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Style picker */}
      <AvatarStylePicker selectedStyle={selectedStyle} onSelect={setSelectedStyle} />

      {/* Generate button */}
      <View style={styles.generateSection}>
        <Button
          title={loading ? 'Generating...' : 'Generate Avatars'}
          onPress={handleGenerate}
          variant="primary"
          size="lg"
          loading={loading}
          disabled={selectedPhotos.length === 0 || loading}
          style={styles.generateButton}
        />
      </View>

      {/* Job progress / results */}
      {job && (
        <View style={styles.jobSection}>
          {(job.status === 'pending' || job.status === 'processing') && (
            <View style={styles.progressContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.progressText}>
                {job.status === 'pending' ? 'Queued...' : 'Generating your avatars...'}
              </Text>
              <Text style={styles.progressSubtext}>This may take 30-60 seconds</Text>
            </View>
          )}

          {job.status === 'failed' && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={32} color={colors.error} />
              <Text style={styles.errorText}>Generation failed</Text>
              <Text style={styles.errorSubtext}>
                {job.error_message || 'Please try again with different photos.'}
              </Text>
            </View>
          )}

          {job.status === 'completed' && job.result_urls.length > 0 && (
            <View style={styles.resultsSection}>
              <Text style={styles.sectionTitle}>Generated Avatars</Text>
              <View style={styles.resultsGrid}>
                {job.result_urls.map((url, index) => (
                  <View key={index} style={styles.resultItem}>
                    <Image
                      source={{ uri: url }}
                      style={styles.resultImage}
                      contentFit="cover"
                      transition={200}
                    />
                    <TouchableOpacity
                      style={styles.saveResultBtn}
                      onPress={() => handleSaveFromResult(url)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="download-outline" size={16} color="#fff" />
                      <Text style={styles.saveResultText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      )}

      {/* Saved avatars */}
      {loadingAvatars ? (
        <LoadingSpinner />
      ) : (
        <AvatarGrid
          avatars={avatars}
          onSelect={setPreviewAvatar}
          onUse={handleSetActive}
        />
      )}

      {/* Avatar preview modal */}
      <Modal visible={!!previewAvatar} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {previewAvatar && (
              <AvatarPreview
                avatar={previewAvatar}
                onSetAsProfile={handleSetActive}
                onRemove={handleRemove}
                onClose={() => setPreviewAvatar(null)}
              />
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxxl * 2,
  },
  heading: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  photoSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.md,
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoThumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.background,
    borderRadius: 11,
  },
  addPhotoBtn: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhotoText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
    marginTop: 2,
  },
  generateSection: {
    paddingHorizontal: spacing.lg,
    marginVertical: spacing.lg,
  },
  generateButton: {
    width: '100%',
  },
  jobSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  progressContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  progressText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  progressSubtext: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  errorText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.error,
  },
  errorSubtext: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  resultsSection: {
    marginTop: spacing.md,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  resultItem: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.sm) / 2,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.backgroundSecondary,
  },
  resultImage: {
    width: '100%',
    aspectRatio: 1,
  },
  saveResultBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primary,
  },
  saveResultText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    width: SCREEN_WIDTH - spacing.lg * 2,
    maxHeight: '90%',
    overflow: 'hidden',
  },
});
