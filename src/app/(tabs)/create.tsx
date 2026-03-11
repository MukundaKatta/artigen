import React, { useEffect, useMemo } from 'react';
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
import { useTheme } from '@/providers/ThemeProvider';
import { showAlert } from '@/utils/alert';
import { spacing, fontSize, typography, borderRadius, shadows } from '@/lib/theme';
import type { ThemeColors } from '@/lib/theme';

type ToolCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
  gradient: [string, string];
  index: number;
  themeColors: ThemeColors;
};

function ToolCard({ icon, title, subtitle, onPress, gradient, index, themeColors }: ToolCardProps) {
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
      }} style={[styles.card, shadows.sm as any, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <Ionicons name={icon} size={26} color="#fff" />
        </LinearGradient>
        <View style={styles.cardContent}>
          <Text style={[styles.cardTitle, { color: themeColors.text }]}>{title}</Text>
          <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>{subtitle}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={themeColors.textSecondary} />
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function CreateRoute() {
  const router = useRouter();
  const { pickFromGallery } = useImagePicker();
  const { themeColors } = useTheme();

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

  const TOOLS: Omit<ToolCardProps, 'index' | 'themeColors'>[] = useMemo(() => [
    {
      icon: 'sparkles',
      title: 'Generate with AI',
      subtitle: 'Create images from text prompts',
      onPress: () => router.push('/(camera)/generate'),
      gradient: [themeColors.accent, themeColors.accentDark],
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
  ], [router, themeColors]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.title, { color: themeColors.text }]}>Create</Text>
      <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>Share AI art with the world</Text>
      <View style={[styles.divider, { backgroundColor: themeColors.border }]} />

      {TOOLS.map((tool, index) => (
        <ToolCard key={tool.title} {...tool} index={index} themeColors={themeColors} />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxxl,
    paddingBottom: 100,
  },
  title: {
    fontSize: fontSize.xxl,
    fontFamily: typography.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    marginBottom: spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: spacing.xl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
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
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
  },
});
