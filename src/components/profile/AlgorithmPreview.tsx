import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

type Props = { profile: any };

export function AlgorithmPreview({ profile }: Props) {
  if (!profile) return null;
  const styles_list = profile.preferred_styles?.slice(0, 5) || [];
  const themes = profile.preferred_themes?.slice(0, 5) || [];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="sparkles" size={18} color={colors.primary} />
        <Text style={styles.title}>Your Algorithm</Text>
      </View>
      {styles_list.length > 0 && (
        <Text style={styles.text}>Styles: {styles_list.join(', ')}</Text>
      )}
      {themes.length > 0 && (
        <Text style={styles.text}>Themes: {themes.join(', ')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.md, margin: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xs },
  title: { fontSize: fontSize.md, fontFamily: typography.bold, color: colors.text },
  text: { fontSize: fontSize.sm, color: colors.textSecondary, marginTop: 2 },
});
