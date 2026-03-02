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

  const TOOLS = [
    {
      icon: 'cloud-upload-outline' as const,
      title: 'Upload Photo / Video',
      subtitle: 'Share your own AI creations',
      onPress: handleUpload,
      iconBg: 'rgba(0,149,246,0.1)',
      iconColor: colors.primary,
      border: colors.border,
    },
    {
      icon: 'sparkles' as const,
      title: 'Generate with AI',
      subtitle: 'Create images from text prompts',
      onPress: handleGenerate,
      iconBg: '#8B5CF6',
      iconColor: '#fff',
      border: 'rgba(139,92,246,0.3)',
    },
    {
      icon: 'book-outline' as const,
      title: 'Comic Generator',
      subtitle: 'Turn your story into AI panels',
      onPress: () => router.push('/(camera)/comic'),
      iconBg: '#E1306C',
      iconColor: '#fff',
      border: 'rgba(225,48,108,0.3)',
    },
    {
      icon: 'flask-outline' as const,
      title: 'Art Genetics',
      subtitle: 'Breed two artworks into a new one',
      onPress: () => router.push('/(screens)/art-genetics'),
      iconBg: '#515BD4',
      iconColor: '#fff',
      border: 'rgba(81,91,212,0.3)',
    },
    {
      icon: 'moon-outline' as const,
      title: 'Ambient Art Mode',
      subtitle: 'Endless AI art based on your taste',
      onPress: () => router.push('/(screens)/ambient-mode'),
      iconBg: '#0a0a2e',
      iconColor: '#9b8fff',
      border: 'rgba(155,143,255,0.3)',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create</Text>
      <Text style={styles.subtitle}>Share AI art with the world</Text>

      {TOOLS.map((tool) => (
        <Pressable
          key={tool.title}
          style={[styles.card, { borderColor: tool.border }]}
          onPress={tool.onPress}
        >
          <View style={[styles.iconContainer, { backgroundColor: tool.iconBg }]}>
            <Ionicons name={tool.icon} size={28} color={tool.iconColor} />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{tool.title}</Text>
            <Text style={styles.cardSubtitle}>{tool.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </Pressable>
      ))}
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(0, 149, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
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
