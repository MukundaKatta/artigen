import { supabase } from '@/lib/supabase';

export type CollabRoom = {
  id: string;
  name: string;
  host_id: string;
  host_username: string;
  host_avatar: string;
  status: 'waiting' | 'active' | 'completed';
  max_participants: number;
  current_participants: number;
  prompt: string;
  style: string | null;
  created_at: string;
  participants: CollabParticipant[];
  rounds: CollabRound[];
};

export type CollabParticipant = {
  id: string;
  user_id: string;
  username: string;
  avatar_url: string;
  joined_at: string;
  is_ready: boolean;
};

export type CollabRound = {
  id: string;
  round_number: number;
  prompt_modifier: string;
  status: 'pending' | 'generating' | 'voting' | 'complete';
  submissions: CollabSubmission[];
  winner_id: string | null;
};

export type CollabSubmission = {
  id: string;
  user_id: string;
  username: string;
  image_url: string;
  prompt_used: string;
  votes: number;
  created_at: string;
};

export async function createCollabRoom(
  hostId: string,
  name: string,
  prompt: string,
  maxParticipants: number = 4,
): Promise<string | null> {
  const { data, error } = await supabase
    .from('collab_rooms')
    .insert({
      name,
      host_id: hostId,
      prompt,
      max_participants: maxParticipants,
      status: 'waiting',
    })
    .select('id')
    .single();

  if (error) return null;

  // Auto-join host
  await supabase.from('collab_room_participants').insert({
    room_id: data.id,
    user_id: hostId,
    is_ready: true,
  });

  return data.id;
}

export async function joinCollabRoom(roomId: string, userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('collab_room_participants')
    .insert({ room_id: roomId, user_id: userId, is_ready: false });

  return !error;
}

export async function leaveCollabRoom(roomId: string, userId: string): Promise<void> {
  await supabase
    .from('collab_room_participants')
    .delete()
    .eq('room_id', roomId)
    .eq('user_id', userId);
}

export async function setReady(roomId: string, userId: string, ready: boolean): Promise<void> {
  await supabase
    .from('collab_room_participants')
    .update({ is_ready: ready })
    .eq('room_id', roomId)
    .eq('user_id', userId);
}

export async function submitToRound(
  roundId: string,
  userId: string,
  imageUrl: string,
  promptUsed: string,
): Promise<void> {
  await supabase.from('collab_submissions').insert({
    round_id: roundId,
    user_id: userId,
    image_url: imageUrl,
    prompt_used: promptUsed,
  });
}

export async function voteOnSubmission(submissionId: string, userId: string): Promise<void> {
  await supabase.from('collab_votes').insert({
    submission_id: submissionId,
    user_id: userId,
  });
}

export async function fetchActiveRooms(): Promise<CollabRoom[]> {
  const { data } = await supabase
    .from('collab_rooms')
    .select(`
      *,
      host:profiles!host_id(username, avatar_url),
      participants:collab_room_participants(count)
    `)
    .in('status', ['waiting', 'active'])
    .order('created_at', { ascending: false })
    .limit(20);

  return (data || []).map((room) => ({
    ...room,
    host_username: room.host?.username || '',
    host_avatar: room.host?.avatar_url || '',
    current_participants: room.participants?.[0]?.count || 0,
    participants: [],
    rounds: [],
  }));
}

export async function fetchRoom(roomId: string): Promise<CollabRoom | null> {
  const { data } = await supabase
    .from('collab_rooms')
    .select(`
      *,
      host:profiles!host_id(username, avatar_url),
      participants:collab_room_participants(
        id, user_id, is_ready, joined_at,
        user:profiles(username, avatar_url)
      ),
      rounds:collab_rounds(
        id, round_number, prompt_modifier, status, winner_id,
        submissions:collab_submissions(
          id, user_id, image_url, prompt_used, created_at,
          user:profiles(username),
          votes:collab_votes(count)
        )
      )
    `)
    .eq('id', roomId)
    .single();

  if (!data) return null;

  return {
    ...data,
    host_username: data.host?.username || '',
    host_avatar: data.host?.avatar_url || '',
    current_participants: data.participants?.length || 0,
    participants: (data.participants || []).map((p: Record<string, unknown>) => ({
      ...p,
      username: (p.user as Record<string, string>)?.username || '',
      avatar_url: (p.user as Record<string, string>)?.avatar_url || '',
    })),
    rounds: (data.rounds || []).map((r: Record<string, unknown>) => ({
      ...r,
      submissions: ((r.submissions as Record<string, unknown>[]) || []).map((s: Record<string, unknown>) => ({
        ...s,
        username: (s.user as Record<string, string>)?.username || '',
        votes: (s.votes as { count: number }[])?.[0]?.count || 0,
      })),
    })),
  } as CollabRoom;
}

export function subscribeToRoom(roomId: string, callback: (payload: unknown) => void) {
  return supabase
    .channel(`collab-room-${roomId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'collab_rooms', filter: `id=eq.${roomId}` }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'collab_room_participants', filter: `room_id=eq.${roomId}` }, callback)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'collab_submissions', filter: `room_id=eq.${roomId}` }, callback)
    .subscribe();
}
