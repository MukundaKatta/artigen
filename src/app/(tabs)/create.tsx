import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useImagePicker } from '@/hooks/useImagePicker';
import { showAlert } from '@/utils/alert';
import { colors, spacing, fontSize, typography, borderRadius, shadows } from '@/lib/theme';

export default function CreateRoute() {
  const router = useRouter();
  const { pickFromGallery } = useImagePicker();

  async function handleUpload() {
    const { asset, error } = await pickFromGallery();

    if (error) {
      showAlert('Error', error);
      return;
    }

    if (asset) {
      router.push({
        pathname: '/(camera)/new-post',
        params: {
          imageUri: asset.uri,
          imageWidth: String(asset.width),
          imageHeight: String(asset.height),
        },
      });
    }
  }

  function handleGenerate() {
    router.push('/(camera)/generate');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create</Text>
      <Text style={styles.subtitle}>Share AI art with the world</Text>

      <Pressable style={styles.card} onPress={handleUpload}>
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-upload-outline" size={28} color={colors.primary} />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Upload Photo / Video</Text>
          <Text style={styles.cardSubtitle}>Share your own AI creations</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </Pressable>

      <Pressable style={[styles.card, styles.aiCard]} onPress={handleGenerate}>
        <View style={[styles.iconContainer, styles.aiIconContainer]}>
          <Ionicons name="sparkles" size={28} color="#fff" />
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>Generate with AI</Text>
          <Text style={styles.cardSubtitle}>Create images from text prompts</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginBottom: spacing.xxxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  aiCard: {
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(0, 149, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiIconContainer: {
    backgroundColor: '#8B5CF6',
  },
  cardContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
});
