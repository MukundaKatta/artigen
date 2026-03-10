import React, { useEffect, useState } from 'react';
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
} from 'react-native-reanimated';
import { colors, gradients, spacing, fontSize, typography } from '@/lib/theme';

// Estimated generation times by provider (seconds)
const ESTIMATED_TIMES: Record<string, number> = {
  huggingface: 15,
  replicate: 25,
  openai: 12,
  gemini: 10,
};

type Props = {
  prompt: string;
  modelName: string;
  provider: string;
};

export function GeneratingView({ prompt, modelName, provider }: Props) {
  const pulse = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const [elapsed, setElapsed] = useState(0);
  const estimatedTime = ESTIMATED_TIMES[provider] ?? 20;

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

  return (
    <View style={styles.centerContainer}>
      <Animated.View style={glowStyle}>
        <LinearGradient
          colors={gradients.ai}
          style={styles.generatingOrb}
        >
          <Ionicons name="sparkles" size={40} color="#fff" />
        </LinearGradient>
      </Animated.View>
      <Text style={styles.generatingTitle}>Creating your art...</Text>
      <Text style={styles.generatingPrompt} numberOfLines={3}>
        "{prompt}"
      </Text>
      <View style={styles.generatingModelRow}>
        <Ionicons name="sparkles" size={12} color={colors.accent} />
        <Text style={styles.generatingModel}>{modelName}</Text>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
        <Animated.View style={[styles.progressShimmer, shimmerStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(139,92,246,0.5)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: 200, height: '100%' }}
          />
        </Animated.View>
      </View>
      <Text style={styles.progressText}>
        {elapsed}s elapsed{remaining > 0 ? ` · ~${remaining}s remaining` : ' · Finishing up...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.text,
    marginTop: spacing.xl,
  },
  generatingPrompt: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
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
    color: colors.accent,
  },
  progressBar: {
    width: 200,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    overflow: 'hidden',
    marginTop: spacing.xl,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.accent,
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
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});
