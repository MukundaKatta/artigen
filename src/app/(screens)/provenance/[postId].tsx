import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useProvenance } from '@/hooks/useProvenance';
import { colors, spacing, fontSize, typography } from '@/lib/theme';

export default function ProvenanceRoute() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { provenance, loading } = useProvenance(postId);

  if (loading) return <LoadingSpinner fullScreen />;

  if (!provenance) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Art Provenance' }} />
        <View style={styles.emptyIcon}>
          <Ionicons name="shield-outline" size={32} color={colors.textSecondary} />
        </View>
        <Text style={styles.emptyTitle}>No provenance data</Text>
        <Text style={styles.emptyText}>Provenance information is not available for this artwork</Text>
      </View>
    );
  }

  const status = provenance.verification_status;
  const statusColor = status === 'verified' ? '#4CAF50' : status === 'tampered' ? '#F44336' : '#FF9800';

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Art Provenance' }} />
      <View style={styles.statusCard}>
        <Ionicons name={status === 'verified' ? 'shield-checkmark' : 'shield-outline'} size={32} color={statusColor} />
        <Text style={[styles.statusText, { color: statusColor }]}>{status.toUpperCase()}</Text>
      </View>
      <View style={styles.section}>
        <DetailRow label="Content Hash" value={provenance.content_hash} />
        {provenance.prompt_hash && <DetailRow label="Prompt Hash" value={provenance.prompt_hash} />}
        {provenance.model_name && <DetailRow label="Model" value={provenance.model_name} />}
        <DetailRow label="Generated" value={new Date(provenance.generation_date).toLocaleDateString()} />
        <DetailRow label="Signature" value={provenance.signature.substring(0, 32) + '...'} />
      </View>
      {provenance.c2pa_manifest && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>C2PA Manifest</Text>
          <Text style={styles.manifest}>{JSON.stringify(provenance.c2pa_manifest, null, 2)}</Text>
        </View>
      )}
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} selectable>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.md },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  emptyText: { fontSize: fontSize.md, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: spacing.xl },
  statusCard: { alignItems: 'center', padding: spacing.xl, gap: spacing.sm },
  statusText: { fontSize: fontSize.lg, fontFamily: typography.bold },
  section: { padding: spacing.lg, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  sectionTitle: { fontSize: fontSize.md, fontFamily: typography.semiBold, color: colors.text, marginBottom: spacing.sm },
  detailRow: { flexDirection: 'row', paddingVertical: spacing.sm },
  detailLabel: { width: 100, fontSize: fontSize.sm, fontFamily: typography.semiBold, color: colors.textSecondary },
  detailValue: { flex: 1, fontSize: fontSize.sm, fontFamily: typography.regular, color: colors.text },
  manifest: { fontSize: 11, fontFamily: typography.regular, color: colors.textSecondary, lineHeight: 16 },
});
