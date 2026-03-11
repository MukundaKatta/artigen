import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import type { ThemeColors } from '@/lib/theme';

/**
 * Create themed styles that respond to dark/light mode changes.
 *
 * Usage:
 * ```
 * const styles = useThemedStyles((colors) => ({
 *   container: { backgroundColor: colors.background },
 *   text: { color: colors.text },
 * }));
 * ```
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T>>(
  factory: (colors: ThemeColors) => T,
): T {
  const { themeColors } = useTheme();
  return useMemo(() => StyleSheet.create(factory(themeColors)), [themeColors, factory]);
}
