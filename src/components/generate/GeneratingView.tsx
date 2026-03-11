import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
  FadeIn,
} from 'react-native-reanimated';
import { useTheme } from '@/providers/ThemeProvider';
import { gradients, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

// Estimated generation times by provider (seconds)
const ESTIMATED_TIMES: Record<string, number> = {
  huggingface: 15,
  replicate: 25,
  openai: 12,
  gemini: 10,
};

const CREATIVE_TIPS = [
  'Adding specific art styles (e.g. "oil painting", "watercolor") dramatically changes results',
  'Describe lighting explicitly — "golden hour", "dramatic side lighting", "soft diffused"',
  'Include composition hints: "close-up portrait", "wide angle", "bird\'s eye view"',
  'Negative prompts remove unwanted elements — try "blurry, low quality, distorted"',
  'Reference specific artists or art movements for stylistic control',
  'More detail = better results. Describe textures, materials, and atmosphere',
  'Use aspect ratios that match your subject — 16:9 for landscapes, 9:16 for portraits',
  'Try different models for the same prompt — each has a unique aesthetic',
  'ControlNet can guide composition using reference poses or edge maps',
  'Save your best prompts to the Prompt Library for easy reuse',
];

type Props = {
  prompt: string;
  modelName: string;
  provider: string;
};

export function GeneratingView({ prompt, modelName, provider }: Props) {
  const { themeColors } = useTheme();
  const pulse = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const [elapsed, setElapsed] = useState(0);
  const estimatedTime = ESTIMATED_TIMES[provider] ?? 20;

  // Pick a random tip on mount
  const tip = useMemo(
    () => CREATIVE_TIPS[Math.floor(Math.random() * CREATIVE_TIPS.length)],
    [],
  );

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }), -1, true);
    shimmer.value = withRepeat(withTiming(1, { duration: 1500, easing: Easing.linear }), -1, false);
  }, [pulse, shimmer]);

  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.3, 0.8]),
    transform: [{ scale: interpolate(pulse.value, [0, 1], [0.95, 1.05]) }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-200, 200]) }],
  }));

  const progressPercent = Math.min((elapsed / estimatedTime) * 100, 95);
  const remaining = Math.max(estimatedTime - elapsed, 0);

  const statusText = elapsed < 3
    ? 'Preparing your prompt...'
    : elapsed < estimatedTime * 0.4
      ? 'Creating your art...'
      : elapsed < estimatedTime * 0.8
        ? 'Adding details...'
        : 'Finishing touches...';

  return (
    <View style={[styles.centerContainer, { backgroundColor: themeColors.background }]}>
      <Animated.View style={glowStyle}>
        <LinearGradient
          colors={gradients.ai}
          style={styles.generatingOrb}
        >
          <Ionicons name="sparkles" size={40} color="#fff" />
        </LinearGradient>
      </Animated.View>
      <Text style={[styles.generatingTitle, { color: themeColors.text }]}>
        {statusText}
      </Text>
      <Text style={[styles.generatingPrompt, { color: themeColors.textSecondary }]} numberOfLines={3}>
        &ldquo;{prompt}&rdquo;
      </Text>
      <View style={styles.generatingModelRow}>
        <Ionicons name="sparkles" size={12} color={themeColors.accent} />
        <Text style={[styles.generatingModel, { color: themeColors.accent }]}>{modelName}</Text>
      </View>
      <View style={[styles.progressBar, { backgroundColor: themeColors.border }]}>
        <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: themeColors.accent }]} />
        <Animated.View style={[styles.progressShimmer, shimmerStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(139,92,246,0.5)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: 200, height: '100%' }}
          />
        </Animated.View>
      </View>
      <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
        {elapsed}s elapsed{remaining > 0 ? ` · ~${remaining}s remaining` : ' · Finishing up...'}
      </Text>

      {/* Creative tip shown after a few seconds */}
      {elapsed >= 4 && (
        <Animated.View
          entering={FadeIn.duration(500)}
          style={[styles.tipCard, { backgroundColor: themeColors.backgroundSecondary, borderColor: themeColors.border }]}
        >
          <View style={styles.tipHeader}>
            <Ionicons name="bulb-outline" size={14} color={themeColors.accent} />
            <Text style={[styles.tipLabel, { color: themeColors.accent }]}>Pro Tip</Text>
          </View>
          <Text style={[styles.tipText, { color: themeColors.textSecondary }]}>{tip}</Text>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  generatingOrb: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  generatingTitle: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    marginTop: spacing.xl,
  },
  generatingPrompt: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    textAlign: 'center',
    marginTop: spacing.sm,
    fontStyle: 'italic',
    paddingHorizontal: spacing.xl,
  },
  generatingModelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  generatingModel: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
  },
  progressBar: {
    width: 200,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: spacing.xl,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 2,
  },
  progressShimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 200,
  },
  progressText: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    marginTop: spacing.sm,
  },
  tipCard: {
    marginTop: spacing.xxxl,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    maxWidth: 320,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  tipLabel: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    lineHeight: 20,
  },
});
