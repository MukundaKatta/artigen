import { useState, useEffect, useCallback } from 'react';
import { getConversations } from '@/services/message.service';
import { supabase } from '@/lib/supabase';
import type { ConversationPreview } from '@/types';

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    const { data } = await getConversations(userId);
    setConversations(data);
    setLoading(false);
  }, [userId]);

  const refresh = useCallback(async () => {
    if (!userId) return;
    const { data } = await getConversations(userId);
    setConversations(data);
  }, [userId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        () => {
          refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, refresh]);

  return { conversations, loading, refresh };
}
