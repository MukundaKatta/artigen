import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

type Props = {
  isVanishMode: boolean;
  onToggle: () => void;
};

export function VanishModeToggle({ isVanishMode, onToggle }: Props) {
  return (
    <TouchableOpacity style={styles.container} onPress={onToggle}>
      <View style={[styles.pill, isVanishMode && styles.pillActive]}>
        <Ionicons
          name={isVanishMode ? 'eye-off' : 'eye-off-outline'}
          size={14}
          color={isVanishMode ? colors.textLight : colors.textSecondary}
        />
        <Text style={[styles.text, isVanishMode && styles.textActive]}>
          {isVanishMode ? 'Vanish Mode On' : 'Vanish Mode'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export function VanishModeBanner() {
  return (
    <View style={styles.banner}>
      <Ionicons name="eye-off" size={16} color="#9333EA" />
      <Text style={styles.bannerText}>
        Messages will disappear after they're seen
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.backgroundSecondary,
  },
  pillActive: {
    backgroundColor: '#9333EA',
  },
  text: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  textActive: {
    color: colors.textLight,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
  },
  bannerText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: '#9333EA',
  },
});
