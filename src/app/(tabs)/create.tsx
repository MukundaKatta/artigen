import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { useImagePicker } from '@/hooks/useImagePicker';
import { showAlert } from '@/utils/alert';
import { colors, spacing, fontSize, typography, borderRadius, shadows } from '@/lib/theme';

type ToolCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  gradient: [string, string];
  index: number;
};

function ToolCard({ icon, title, subtitle, onPress, gradient, index }: ToolCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  useEffect(() => {
    const delay = index * 80;
    opacity.value = withDelay(delay, withTiming(1, { duration: 500, easing: Easing.out(Easing.ease) }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }));
  }, [index, opacity, translateY]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <AnimatedPressable onPress={() => {
        if (Platform.OS !== 'web') Haptics.selectionAsync();
        onPress();
      }} style={[styles.card, shadows.sm as any]}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <Ionicons name={icon} size={26} color="#fff" />
        </LinearGradient>
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardSubtitle}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      </AnimatedPressable>
    </Animated.View>
  );
}

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

  const TOOLS: Omit<ToolCardProps, 'index'>[] = [
    {
      icon: 'sparkles',
      title: 'Generate with AI',
      subtitle: 'Create images from text prompts',
      onPress: () => router.push('/(camera)/generate'),
      gradient: [colors.accent, colors.accentDark],
    },
    {
      icon: 'cloud-upload-outline',
      title: 'Upload Photo / Video',
      subtitle: 'Share your own AI creations',
      onPress: handleUpload,
      gradient: ['#0095F6', '#1877F2'],
    },
    {
      icon: 'book-outline',
      title: 'Comic Generator',
      subtitle: 'Turn your story into AI panels',
      onPress: () => router.push('/(camera)/comic'),
      gradient: ['#E1306C', '#C13584'],
    },
    {
      icon: 'flask-outline',
      title: 'Art Genetics',
      subtitle: 'Breed two artworks into a new one',
      onPress: () => router.push('/(screens)/art-genetics'),
      gradient: ['#515BD4', '#8134AF'],
    },
    {
      icon: 'moon-outline',
      title: 'Ambient Art Mode',
      subtitle: 'Endless AI art based on your taste',
      onPress: () => router.push('/(screens)/ambient-mode'),
      gradient: ['#0a0a2e', '#1a1a4e'],
    },
    {
      icon: 'chatbubble-ellipses-outline',
      title: 'AI Assistant',
      subtitle: 'Chat with Claude, GPT-4o or Gemini',
      onPress: () => router.push('/(screens)/ai-assistant'),
      gradient: ['#F77737', '#FD1D1D'],
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Create</Text>
      <Text style={styles.subtitle}>Share AI art with the world</Text>
      <View style={styles.divider} />

      {TOOLS.map((tool, index) => (
        <ToolCard key={tool.title} {...tool} index={index} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: 100,
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
    marginBottom: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginBottom: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.md,
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
