import { supabase } from '@/lib/supabase';
import { createNotification } from '@/services/notification.service';
import type { ReactionType, ReactionSummary } from '@/types';

export const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: '\u{1F44D}',
  love: '\u{2764}\u{FE0F}',
  haha: '\u{1F602}',
  wow: '\u{1F62E}',
  sad: '\u{1F622}',
  fire: '\u{1F525}',
  clap: '\u{1F44F}',
};

export const REACTION_TYPES: ReactionType[] = ['like', 'love', 'haha', 'wow', 'sad', 'fire', 'clap'];

export async function getPostReactions(postId: string) {
  const { data, error } = await supabase
    .from('post_reactions')
    .select('reaction_type')
    .eq('post_id', postId);

  if (error || !data) return { data: [] as ReactionSummary[], error };

  const counts = new Map<ReactionType, number>();
  for (const r of data) {
    counts.set(r.reaction_type as ReactionType, (counts.get(r.reaction_type as ReactionType) || 0) + 1);
  }

  const summary: ReactionSummary[] = Array.from(counts.entries())
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  return { data: summary, error: null };
}

export async function getUserReaction(userId: string, postId: string) {
  const { data, error } = await supabase
    .from('post_reactions')
    .select('reaction_type')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .maybeSingle();

  return { data: data?.reaction_type as ReactionType | null, error };
}

export async function setReaction(userId: string, postId: string, reactionType: ReactionType) {
  const { data, error } = await supabase
    .from('post_reactions')
    .upsert(
      { user_id: userId, post_id: postId, reaction_type: reactionType },
      { onConflict: 'user_id,post_id' }
    )
    .select()
    .single();

  if (!error) {
    supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .single()
      .then(({ data: post }) => {
        if (post && (post as any).user_id !== userId) {
          createNotification({ type: 'like', senderId: userId, recipientId: (post as any).user_id, postId });
        }
      });
  }

  return { data, error };
}

export async function removeReaction(userId: string, postId: string) {
  const { error } = await supabase
    .from('post_reactions')
    .delete()
    .eq('user_id', userId)
    .eq('post_id', postId);
  return { error };
}
