import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getNearbyLocations } from '@/services/location.service';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { Location } from '@/types';

export default function ExploreMapRoute() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Default to showing popular locations (no coords)
    getNearbyLocations(0, 0, 99999).then(({ data }) => {
      setLocations(data);
      setLoading(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Explore Locations' }} />

      <View style={styles.mapPlaceholder}>
        <Ionicons name="map-outline" size={48} color={colors.border} />
        <Text style={styles.mapText}>Map view requires react-native-maps</Text>
      </View>

      <Text style={styles.sectionTitle}>Popular Locations</Text>
      <FlatList
        data={locations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/(screens)/location/${item.id}`)}
          >
            <View style={styles.locationIcon}>
              <Ionicons name="location" size={20} color={colors.primary} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.name}>{item.name}</Text>
              {item.address && <Text style={styles.address}>{item.address}</Text>}
            </View>
            <Text style={styles.count}>{item.post_count} posts</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapPlaceholder: {
    height: 200,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  mapText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowInfo: {
    flex: 1,
  },
  name: {
    fontSize: fontSize.md,
    fontFamily: typography.medium,
    color: colors.text,
  },
  address: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  count: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
});
