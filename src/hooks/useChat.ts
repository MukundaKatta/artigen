import { useState, useEffect, useCallback } from 'react';
import { MESSAGES_PAGE_SIZE } from '@/lib/constants';
import {
  getMessages,
  sendMessage as sendMessageService,
  markAsRead,
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

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Real-time subscription for new messages in this conversation
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
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
  };
}
