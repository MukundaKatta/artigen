import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getFeatureFlags } from '@/lib/feature-flags';
import { trackEvent, TELEMETRY_EVENTS } from '@/lib/telemetry';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

export default function FutureLabsScreen() {
  const router = useRouter();
  const flags = useMemo(() => getFeatureFlags(), []);

  React.useEffect(() => {
    trackEvent(TELEMETRY_EVENTS.future_labs_opened, {});
  }, []);

  const cards = [
    {
      key: 'transparency-center',
      label: 'Transparency Center',
      description: 'Live provenance and trust timeline controls.',
      enabled: flags.transparency_center,
    },
    {
      key: 'localization-studio',
      label: 'Localization Studio',
      description: 'Auto-dub and subtitle pipeline scaffolding.',
      enabled: flags.localization_studio,
    },
    {
      key: 'spatial-gallery',
      label: 'Spatial Gallery',
      description: 'XR and 3D-ready exhibition publishing foundation.',
      enabled: flags.spatial_gallery,
    },
    {
      key: 'director-mode',
      label: 'Director Mode',
      description: 'Agentic multi-step creation planner contract layer.',
      enabled: flags.director_mode,
    },
  ] as const;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Future Labs' }} />
      <Text style={styles.title}>Future Labs</Text>
      <Text style={styles.subtitle}>Phase 1 internal foundation for next-generation product features.</Text>

      {cards.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={styles.card}
          onPress={() => {
            trackEvent(TELEMETRY_EVENTS.feature_stub_opened, { feature: item.key });
            router.push(`/(screens)/${item.key}` as never);
          }}
          activeOpacity={0.8}
        >
          <View style={styles.rowTop}>
            <Text style={styles.cardTitle}>{item.label}</Text>
            <View style={[styles.pill, item.enabled ? styles.pillOn : styles.pillOff]}>
              <Text style={styles.pillText}>{item.enabled ? 'On' : 'Off'}</Text>
            </View>
          </View>
          <Text style={styles.cardText}>{item.description}</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} style={styles.chevron} />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  title: { fontSize: fontSize.xxl, fontFamily: typography.bold, color: colors.text },
  subtitle: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  rowTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: fontSize.lg, fontFamily: typography.semiBold, color: colors.text },
  cardText: { fontSize: fontSize.sm, fontFamily: typography.regular, color: colors.textSecondary },
  chevron: { position: 'absolute', right: spacing.md, top: spacing.md },
  pill: { borderRadius: borderRadius.full, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  pillOn: { backgroundColor: 'rgba(88, 195, 34, 0.16)' },
  pillOff: { backgroundColor: 'rgba(255, 187, 0, 0.2)' },
  pillText: { fontSize: fontSize.xs, fontFamily: typography.semiBold, color: colors.text },
});
