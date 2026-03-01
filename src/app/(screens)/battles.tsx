import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useBattles } from '@/hooks/useBattles';
import { BattleCard } from '@/components/battles/BattleCard';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { BattleWithUsers } from '@/services/battle.service';

export default function BattlesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { battles, loading, hasMore, refresh, loadMore } = useBattles();

  const renderItem = ({ item }: { item: BattleWithUsers }) => (
    <BattleCard battle={item} />
  );

  if (loading && battles.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Art Battles' }} />
        <ActivityIndicator style={styles.loader} color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Art Battles' }} />
      <FlatList
        data={battles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshing={loading}
        onRefresh={refresh}
        ListHeaderComponent={
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => router.push('/(screens)/battle/create')}
            activeOpacity={0.7}
          >
            <Ionicons name="flash" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Start a Battle</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="flash-outline" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>No battles yet</Text>
            <Text style={styles.emptySubtext}>Be the first to start an art battle!</Text>
          </View>
        }
        ListFooterComponent={
          loading && battles.length > 0 ? (
            <ActivityIndicator style={styles.footerLoader} color={colors.textSecondary} />
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loader: {
    flex: 1,
  },
  list: {
    padding: spacing.lg,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.error,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  createButtonText: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  footerLoader: {
    paddingVertical: spacing.lg,
  },
});
