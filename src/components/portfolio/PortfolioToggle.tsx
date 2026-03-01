import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = {
  enabled: boolean;
  onToggle: (value: boolean) => void;
};

export function PortfolioToggle({ enabled, onToggle }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Portfolio Mode</Text>
        <Text style={styles.subtitle}>
          Enable a curated portfolio view on your profile
        </Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.md,
  },
  title: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});
