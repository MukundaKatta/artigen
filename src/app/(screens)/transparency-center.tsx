import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { FutureFeatureStub } from '@/components/future/FutureFeatureStub';
import { isFeatureEnabled } from '@/lib/feature-flags';
import { trackEvent, TELEMETRY_EVENTS } from '@/lib/telemetry';
import { useAuth } from '@/providers/AuthProvider';
import { getUserProvenance } from '@/services/provenance.service';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ProvenanceSheet } from '@/components/feed/ProvenanceSheet';

export default function TransparencyCenterScreen() {
  const enabled = isFeatureEnabled('transparency_center');
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    if (!enabled || !user) return;
    setLoading(true);
    getUserProvenance(user.id)
      .then(({ data }) => {
        setRecords(data as any[]);
      })
      .catch((err) => {
        logger.warn('Failed to load provenance records:', err);
      })
      .finally(() => setLoading(false));
  }, [enabled, user]);

  if (!enabled) {
    return (
      <>
        <Stack.Screen options={{ title: 'Transparency Center' }} />
        <FutureFeatureStub
          title="Transparency Center"
          summary="Unified disclosure controls for AI-generated media, live provenance, and verification timeline UX."
          enabled={enabled}
          onPrimaryAction={() =>
            trackEvent(TELEMETRY_EVENTS.feature_stub_cta_clicked, { feature: 'transparency_center' })
          }
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Transparency Center' }} />
      <View style={styles.container}>
        {loading ? (
          <LoadingSpinner fullScreen />
        ) : records.length === 0 ? (
          <Text style={styles.emptyText}>
            {user ? 'No provenance records yet.' : 'Sign in to view your provenance.'}
          </Text>
        ) : (
          <FlatList
            data={records}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.itemCard}
                onPress={() => setSelected(item)}
              >
                <Text style={styles.itemTitle} numberOfLines={1}>
                  {item.model_name || 'Unknown model'}
                </Text>
                <Text style={styles.itemSubtitle} numberOfLines={1}>
                  {new Date(item.generation_date).toLocaleDateString()}
                </Text>
                <Text style={styles.itemStatus}>{item.verification_status}</Text>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
      <ProvenanceSheet
        visible={!!selected}
        provenance={selected}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  emptyText: {
    marginTop: 40,
    textAlign: 'center',
    color: '#666',
  },
  itemCard: {
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ddd',
  },
  itemTitle: {
    fontSize: 16,
    fontFamily: 'System',
    fontWeight: '600',
    color: '#000',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  itemStatus: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontStyle: 'italic',
  },
});
