import { supabase } from '@/lib/supabase';
import type { PostPoll, PollOption, PollVote } from '@/types';

/**
 * Create a poll attached to a post.
 * Inserts the poll row and all option rows in order.
 */
export async function createPoll(
  postId: string,
  question: string,
  options: string[],
  endsAt?: string
) {
  const { data: poll, error: pollError } = await supabase
    .from('post_polls')
    .insert({ post_id: postId, question, ends_at: endsAt ?? null })
    .select()
    .single();

  if (pollError || !poll) {
    return { data: null, error: pollError };
  }

  const typedPoll = poll as unknown as PostPoll;

  const optionRows = options.map((text, index) => ({
    poll_id: typedPoll.id,
    text,
    position: index,
  }));

  const { data: optionData, error: optionError } = await supabase
    .from('poll_options')
    .insert(optionRows)
    .select();

  if (optionError) {
    return { data: null, error: optionError };
  }

  return {
    data: {
      ...typedPoll,
      options: (optionData || []) as unknown as PollOption[],
    },
    error: null,
  };
}

/**
 * Vote on a poll option.
 * Inserts a vote row and increments the option's vote_count.
 */
export async function votePoll(pollId: string, optionId: string, userId: string) {
  const { data, error } = await supabase
    .from('poll_votes')
    .insert({ poll_id: pollId, option_id: optionId, user_id: userId })
    .select()
    .single();

  if (!error) {
    // Increment the vote_count on the chosen option
    const { data: option } = await supabase
      .from('poll_options')
      .select('vote_count')
      .eq('id', optionId)
      .single();

    if (option) {
      await supabase
        .from('poll_options')
        .update({ vote_count: ((option as unknown as PollOption).vote_count || 0) + 1 })
        .eq('id', optionId);
    }
  }

  return { data: data as unknown as PollVote | null, error };
}

/**
 * Get the poll for a post, including options and the current user's vote.
 */
export async function getPollForPost(postId: string, userId: string) {
  const { data: poll, error: pollError } = await supabase
    .from('post_polls')
    .select('*')
    .eq('post_id', postId)
    .maybeSingle();

  if (pollError || !poll) {
    return { data: null, error: pollError };
  }

  const typedPoll = poll as unknown as PostPoll;

  // Fetch options ordered by position
  const { data: options } = await supabase
    .from('poll_options')
    .select('*')
    .eq('poll_id', typedPoll.id)
    .order('position', { ascending: true });

  // Fetch user's vote for this poll
  const { data: userVote } = await supabase
    .from('poll_votes')
    .select('option_id')
    .eq('poll_id', typedPoll.id)
    .eq('user_id', userId)
    .maybeSingle();

  return {
    data: {
      question: typedPoll.question,
      ends_at: typedPoll.ends_at ?? undefined,
      options: ((options || []) as unknown as PollOption[]).map((o) => ({
        id: o.id,
        text: o.text,
        vote_count: o.vote_count,
      })),
      userVoteOptionId: (userVote as unknown as { option_id: string } | null)?.option_id,
    },
    error: null,
  };
}
