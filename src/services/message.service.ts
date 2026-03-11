import { supabase } from '@/lib/supabase';
import { MESSAGES_PAGE_SIZE } from '@/lib/constants';
import { sanitizeText } from '@/lib/sanitize';
import type { Profile, Message, MessageWithSender, Conversation } from '@/types/database';
import type { ConversationPreview } from '@/types';

export async function getConversations(userId: string) {
  // Get conversation IDs where user participates
  const { data: participations, error: pError } = await supabase
    .from('conversation_participants')
    .select('conversation_id, last_read_at')
    .eq('user_id', userId);

  if (pError || !participations || participations.length === 0) {
    return { data: [] as ConversationPreview[], error: pError };
  }

  const convIds = participations.map((p: any) => p.conversation_id as string);
  const lastReadMap = new Map(
    participations.map((p: any) => [p.conversation_id as string, p.last_read_at as string | null])
  );

  // Get conversations
  const { data: conversations, error: cError } = await supabase
    .from('conversations')
    .select('*')
    .in('id', convIds)
    .order('updated_at', { ascending: false });

  if (cError || !conversations) {
    return { data: [] as ConversationPreview[], error: cError };
  }

  // Get all participants for these conversations
  const { data: allParticipants } = await supabase
    .from('conversation_participants')
    .select('conversation_id, user_id')
    .in('conversation_id', convIds);

  const participantUserIds = [
    ...new Set((allParticipants || []).map((p: any) => p.user_id as string)),
  ];

  // Fetch profiles for all participants
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .in('id', participantUserIds);

  const profileMap = new Map(
    (profiles || []).map((p: any) => [p.id as string, p as unknown as Profile])
  );

  // Batch-fetch recent messages for all conversations in one query,
  // then pick the latest per conversation client-side.
  // Limit to convIds.length * 3 rows (enough to find 1 latest per conv).
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('*')
    .in('conversation_id', convIds)
    .order('created_at', { ascending: false })
    .limit(Math.max(convIds.length * 3, 50));

  // Build a map of conversation_id → latest message
  const lastMessageMap = new Map<string, Message>();
  for (const msg of (recentMessages || []) as unknown as Message[]) {
    if (!lastMessageMap.has(msg.conversation_id)) {
      lastMessageMap.set(msg.conversation_id, msg);
    }
  }

  // Batch-count unread messages for all conversations in one query
  // For conversations where we have a last_read_at, we count messages after that timestamp.
  // We fetch all unread-candidate messages and count client-side to avoid N+1.
  const { data: unreadMessages } = await supabase
    .from('messages')
    .select('conversation_id, created_at, sender_id')
    .in('conversation_id', convIds)
    .neq('sender_id', userId);

  const unreadCountMap = new Map<string, number>();
  for (const msg of (unreadMessages || []) as unknown as { conversation_id: string; created_at: string; sender_id: string }[]) {
    const lastReadAt = lastReadMap.get(msg.conversation_id);
    if (!lastReadAt || msg.created_at > lastReadAt) {
      unreadCountMap.set(msg.conversation_id, (unreadCountMap.get(msg.conversation_id) || 0) + 1);
    }
  }

  // Build previews
  const previews: ConversationPreview[] = [];

  for (const conv of conversations as unknown as Conversation[]) {
    const cpIds = (allParticipants || [])
      .filter((p: any) => p.conversation_id === conv.id)
      .map((p: any) => p.user_id as string);

    const convProfiles = cpIds
      .map((id: string) => profileMap.get(id))
      .filter(Boolean) as Profile[];

    previews.push({
      ...conv,
      participants: convProfiles,
      lastMessage: lastMessageMap.get(conv.id) || null,
      unreadCount: unreadCountMap.get(conv.id) || 0,
    });
  }

  return { data: previews, error: null };
}

export async function getOrCreateConversation(userId: string, otherUserId: string) {
  // Check if a 1:1 conversation already exists
  const { data: myConvs } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', userId);

  const { data: theirConvs } = await supabase
    .from('conversation_participants')
    .select('conversation_id')
    .eq('user_id', otherUserId);

  if (myConvs && theirConvs) {
    const myIds = new Set(myConvs.map((c: any) => c.conversation_id as string));
    const commonIds = theirConvs
      .map((c: any) => c.conversation_id as string)
      .filter((id: string) => myIds.has(id));

    if (commonIds.length > 0) {
      // Batch fetch all candidate conversations in a single query (avoids N+1)
      const { data: convs } = await supabase
        .from('conversations')
        .select('*')
        .in('id', commonIds)
        .eq('is_group', false)
        .limit(1);

      if (convs && convs.length > 0) {
        return { data: convs[0] as unknown as Conversation, error: null };
      }
    }
  }

  // Create new conversation
  const { data: conv, error: convError } = await supabase
    .from('conversations')
    .insert({ is_group: false })
    .select()
    .single();

  if (convError || !conv) return { data: null, error: convError };

  const typedConv = conv as unknown as Conversation;

  // Add participants
  await supabase.from('conversation_participants').insert([
    { conversation_id: typedConv.id, user_id: userId },
    { conversation_id: typedConv.id, user_id: otherUserId },
  ]);

  return { data: typedConv, error: null };
}

export async function getMessages(conversationId: string, page = 0) {
  const from = page * MESSAGES_PAGE_SIZE;
  const to = from + MESSAGES_PAGE_SIZE - 1;

  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:profiles!sender_id(*)')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(from, to);

  return { data: (data || []) as unknown as MessageWithSender[], error };
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string | null,
  messageType: Message['message_type'] = 'text',
  mediaUrl?: string,
  sharedPostId?: string
) {
  // Sanitize user-provided content to strip HTML/control characters
  const sanitizedContent = content ? sanitizeText(content) : null;

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: sanitizedContent,
      message_type: messageType,
      media_url: mediaUrl || null,
      shared_post_id: sharedPostId || null,
    })
    .select('*, sender:profiles!sender_id(*)')
    .single();

  if (!error) {
    // Update conversation's updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  }

  return { data: data as unknown as MessageWithSender | null, error };
}

export async function sendStoryReply(
  senderId: string,
  storyUserId: string,
  content: string
) {
  const { data: conversation, error: convError } = await getOrCreateConversation(senderId, storyUserId);
  if (convError || !conversation) return { data: null, error: convError };

  return sendMessage(conversation.id, senderId, content, 'story_reply');
}

export async function getSharedPost(postId: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*, user:profiles!user_id(id, username, avatar_url), media:post_media(*)')
    .eq('id', postId)
    .single();
  return { data, error };
}

export async function getReadStatus(conversationId: string, currentUserId: string) {
  const { data } = await supabase
    .from('conversation_participants')
    .select('user_id, last_read_at')
    .eq('conversation_id', conversationId)
    .neq('user_id', currentUserId);
  return data as { user_id: string; last_read_at: string | null }[] | null;
}

export async function markAsRead(conversationId: string, userId: string) {
  const { error } = await supabase
    .from('conversation_participants')
    .update({ last_read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);
  return { error };
}
