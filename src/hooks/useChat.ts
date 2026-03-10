import { useState, useEffect, useCallback, useRef } from 'react';
import { MESSAGES_PAGE_SIZE } from '@/lib/constants';
import {
  getMessages,
  sendMessage as sendMessageService,
  markAsRead,
  getReadStatus,
} from '@/services/message.service';
import { supabase } from '@/lib/supabase';
import type { MessageWithSender } from '@/types';

export function useChat(conversationId: string | undefined, userId: string | undefined) {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Read receipts
  const [otherLastReadAt, setOtherLastReadAt] = useState<string | null>(null);

  // Typing indicators
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const presenceChannelRef = useRef<ReturnType<typeof supabase.channel>>();

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await getMessages(conversationId, 0);
    setMessages(data);
    setPage(0);
    setHasMore(data.length >= MESSAGES_PAGE_SIZE);
    setLoading(false);

    // Mark as read
    if (userId) {
      markAsRead(conversationId, userId);
    }
  }, [conversationId, userId]);

  const loadMore = useCallback(async () => {
    if (!conversationId || loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const { data } = await getMessages(conversationId, nextPage);
    setMessages((prev) => [...prev, ...data]);
    setPage(nextPage);
    setHasMore(data.length >= MESSAGES_PAGE_SIZE);
    setLoadingMore(false);
  }, [conversationId, page, loadingMore, hasMore]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !userId || !content.trim()) return;
      setSending(true);
      const { data, error } = await sendMessageService(
        conversationId,
        userId,
        content.trim()
      );
      if (data && !error) {
        setMessages((prev) => [data, ...prev]);
      }
      setSending(false);
    },
    [conversationId, userId]
  );

  // Broadcast typing state
  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (presenceChannelRef.current && userId) {
        presenceChannelRef.current.track({
          typing: isTyping,
          userId,
        });
      }
    },
    [userId]
  );

  // Call this when user types in input
  const onTyping = useCallback(() => {
    setTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 3000);
  }, [setTyping]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Fetch initial read status
  useEffect(() => {
    if (!conversationId || !userId) return;
    getReadStatus(conversationId, userId).then((data) => {
      if (data && data.length > 0) {
        setOtherLastReadAt(data[0].last_read_at);
      }
    }).catch((err) => console.warn('Failed to fetch read status:', err));
  }, [conversationId, userId]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!conversationId || !userId) return;

    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const newMsg = payload.new as any;
          // Don't duplicate our own messages (already added optimistically)
          if (newMsg.sender_id === userId) return;

          // Fetch with sender profile
          const { data } = await supabase
            .from('messages')
            .select('*, sender:profiles!sender_id(*)')
            .eq('id', newMsg.id)
            .single();

          if (data) {
            setMessages((prev) => [data as unknown as MessageWithSender, ...prev]);
            markAsRead(conversationId, userId);
          }
        }
      )
      // Subscribe to read receipt updates
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_participants',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const updated = payload.new as any;
          if (updated.user_id !== userId) {
            setOtherLastReadAt(updated.last_read_at);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

  // Presence channel for typing indicators
  useEffect(() => {
    if (!conversationId || !userId) return;

    const presenceChannel = supabase.channel(`presence-${conversationId}`, {
      config: { presence: { key: userId } },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        let otherIsTyping = false;
        for (const key of Object.keys(state)) {
          if (key !== userId) {
            const presences = state[key] as any[];
            if (presences?.some((p: any) => p.typing)) {
              otherIsTyping = true;
              break;
            }
          }
        }
        setIsOtherTyping(otherIsTyping);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({ typing: false, userId });
        }
      });

    presenceChannelRef.current = presenceChannel;

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      supabase.removeChannel(presenceChannel);
    };
  }, [conversationId, userId]);

  return {
    messages,
    loading,
    loadingMore,
    sending,
    hasMore,
    sendMessage,
    loadMore,
    refresh: fetchMessages,
    otherLastReadAt,
    isOtherTyping,
    onTyping,
  };
}
