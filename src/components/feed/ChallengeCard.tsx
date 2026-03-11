import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { DailyChallenge } from '@/types';

type ChallengeCardProps = {
  challenge: DailyChallenge;
};

export const ChallengeCard = React.memo(function ChallengeCard({ challenge }: ChallengeCardProps) {
  const router = useRouter();

  return (
    <AnimatedPressable
      style={styles.container}
      onPress={() => {
        if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push('/(screens)/challenge');
      }}
      scaleValue={0.97}
      accessibilityLabel={`Daily Challenge: ${challenge.prompt_theme}`}
      accessibilityRole="button"
      accessibilityHint="Tap to join the daily challenge"
    >
      <LinearGradient
        colors={['#7C3AED', '#A855F7', '#C084FC'] as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Sparkle decorations */}
        <View style={styles.sparkleTopRight}>
          <Ionicons name="sparkles" size={20} color="rgba(255,255,255,0.3)" />
        </View>
        <View style={styles.sparkleBottomLeft}>
          <Ionicons name="sparkles" size={14} color="rgba(255,255,255,0.2)" />
        </View>

        {/* Content */}
        <View style={styles.contentRow}>
          <View style={styles.textContainer}>
            <View style={styles.labelRow}>
              <Ionicons name="sparkles" size={14} color="#fff" />
              <Text style={styles.label}>Daily Challenge</Text>
            </View>
            <Text style={styles.theme} numberOfLines={2}>
              {challenge.prompt_theme}
            </Text>
          </View>
          <AnimatedPressable
            style={styles.joinButton}
            onPress={() => {
              if (Platform.OS !== 'web') Haptics.selectionAsync();
              router.push('/(screens)/challenge');
            }}
            scaleValue={0.9}
          >
            <Text style={styles.joinButtonText}>Join</Text>
          </AnimatedPressable>
        </View>
      </LinearGradient>
    </AnimatedPressable>
  );
});

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    padding: spacing.lg,
    position: 'relative',
  },
  sparkleTopRight: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  sparkleBottomLeft: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  theme: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 22,
  },
  joinButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  joinButtonText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: '#fff',
  },
});
