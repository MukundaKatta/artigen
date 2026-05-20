import { useEffect, useRef, useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

type RealtimeEvent = {
  type: 'new_post' | 'post_deleted' | 'post_updated';
  postId: string;
};

/**
 * Subscribe to real-time feed events (new posts, deletions, updates).
 * Returns a count of new posts since the user last refreshed.
 */
export function useRealtimeFeed(
  userId: string | undefined,
  onNewPost?: () => void,
) {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const [newPostCount, setNewPostCount] = useState(0);

  const resetCount = useCallback(() => {
    setNewPostCount(0);
  }, []);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('feed-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          // Only notify if it's not our own post
          const newRow = payload.new as { user_id?: string } | null;
          if (newRow && newRow.user_id !== userId) {
            setNewPostCount((c) => c + 1);
            onNewPost?.();
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'posts',
        },
        () => {
          // Post deleted - could trigger feed refresh
        },
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [userId, onNewPost]);

  return { newPostCount, resetCount };
}
