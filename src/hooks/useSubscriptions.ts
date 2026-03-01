import { useState, useCallback, useEffect } from 'react';
import * as subscriptionService from '@/services/subscription.service';

export function useSubscriptions(creatorId?: string, currentUserId?: string) {
  const [tiers, setTiers] = useState<any[]>([]);
  const [activeSubscription, setActiveSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const fetchTiers = useCallback(async () => {
    if (!creatorId) return;
    setLoading(true);
    const { data } = await subscriptionService.getCreatorTiers(creatorId);
    setTiers(data || []);
    setLoading(false);
  }, [creatorId]);

  const checkSubscription = useCallback(async () => {
    if (!currentUserId || !creatorId) return;
    const { data } = await subscriptionService.checkSubscription(currentUserId, creatorId);
    setActiveSubscription(data);
  }, [currentUserId, creatorId]);

  useEffect(() => {
    fetchTiers();
    checkSubscription();
  }, [fetchTiers, checkSubscription]);

  const subscribe = useCallback(async (tierId: string) => {
    if (!currentUserId || !creatorId) return;
    setSubscribing(true);
    const { data, error } = await subscriptionService.subscribe(currentUserId, creatorId, tierId);
    if (!error) setActiveSubscription(data);
    setSubscribing(false);
    return { error };
  }, [currentUserId, creatorId]);

  const cancel = useCallback(async () => {
    if (!currentUserId || !creatorId) return;
    const { error } = await subscriptionService.cancelSubscription(currentUserId, creatorId);
    if (!error) setActiveSubscription(null);
    return { error };
  }, [currentUserId, creatorId]);

  return {
    tiers,
    activeSubscription,
    isSubscribed: !!activeSubscription,
    loading,
    subscribing,
    subscribe,
    cancel,
    refresh: fetchTiers,
  };
}
