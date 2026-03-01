import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import { SCREEN_WIDTH } from '@/lib/constants';

type Props = { sourceUrl: string; resultUrl?: string; loading?: boolean };

export function RestylePreview({ sourceUrl, resultUrl, loading }: Props) {
  const halfWidth = (SCREEN_WIDTH - spacing.md * 3) / 2;
  return (
    <View style={styles.container}>
      <View>
        <Text style={styles.label}>Original</Text>
        <Image source={{ uri: sourceUrl }} style={[styles.image, { width: halfWidth }]} />
      </View>
      <View>
        <Text style={styles.label}>Restyled</Text>
        {resultUrl ? (
          <Image source={{ uri: resultUrl }} style={[styles.image, { width: halfWidth }]} />
        ) : (
          <View style={[styles.image, styles.placeholder, { width: halfWidth }]}>
            <Text style={styles.placeholderText}>{loading ? 'Processing...' : 'Select a style'}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  label: { fontSize: fontSize.xs, color: colors.textSecondary, fontFamily: typography.medium, marginBottom: 4 },
  image: { aspectRatio: 1, borderRadius: 8 },
  placeholder: { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: colors.textSecondary, fontSize: fontSize.sm },
});
