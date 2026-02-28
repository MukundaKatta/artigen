import { supabase } from '@/lib/supabase';
import { MESSAGES_PAGE_SIZE } from '@/lib/constants';
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

  // Build previews
  const previews: ConversationPreview[] = [];

  for (const conv of conversations as unknown as Conversation[]) {
    const cpIds = (allParticipants || [])
      .filter((p: any) => p.conversation_id === conv.id)
      .map((p: any) => p.user_id as string);

    const convProfiles = cpIds
      .map((id: string) => profileMap.get(id))
      .filter(Boolean) as Profile[];

    // Get last message
    const { data: lastMessages } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: false })
      .limit(1);

    const lastMessage = (lastMessages?.[0] as unknown as Message) || null;
    const lastReadAt = lastReadMap.get(conv.id);

    // Count unread
    let unreadCount = 0;
    if (lastReadAt && lastMessage) {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .neq('sender_id', userId)
        .gt('created_at', lastReadAt);
      unreadCount = count || 0;
    } else if (!lastReadAt && lastMessage) {
      const { count } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .neq('sender_id', userId);
      unreadCount = count || 0;
    }

    previews.push({
      ...conv,
      participants: convProfiles,
      lastMessage,
      unreadCount,
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

    for (const convId of commonIds) {
      const { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', convId)
        .eq('is_group', false)
        .maybeSingle();

      if (conv) return { data: conv as unknown as Conversation, error: null };
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
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
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
