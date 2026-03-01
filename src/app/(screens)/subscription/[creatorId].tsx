import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { SubscriptionTiers } from '@/components/profile/SubscriptionTiers';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { colors } from '@/lib/theme';

export default function SubscriptionScreen() {
  const { creatorId } = useLocalSearchParams<{ creatorId: string }>();
  const { user } = useAuth();
  const { tiers, activeSubscription, loading, subscribe } = useSubscriptions(creatorId, user?.id);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <ScrollView style={styles.container}>
      <SubscriptionTiers
        tiers={tiers}
        onSubscribe={(tierId) => subscribe(tierId)}
        isSubscribed={!!activeSubscription}
        activeTierId={activeSubscription?.tier_id}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
});
