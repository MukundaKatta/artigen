import { corsHeaders, jsonResponse, createServiceClient, requireAuth } from '../_shared/auth.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authResult = await requireAuth(req);
    if (authResult instanceof Response) return authResult;

    const supabase = createServiceClient();
    const { battle_id } = await req.json();

    if (!battle_id) {
      return jsonResponse({ error: 'battle_id required' }, 400);
    }

    // Get the battle
    const { data: battle } = await supabase.from('art_battles').select('*').eq('id', battle_id).single();
    if (!battle) {
      return jsonResponse({ error: 'Battle not found' }, 404);
    }

    // Only the battle creator or an admin can finalize
    if (battle.creator_id !== authResult.userId) {
      return jsonResponse({ error: 'Only the battle creator can finalize' }, 403);
    }

    // Check if already completed
    if (battle.status === 'completed') {
      return jsonResponse({ error: 'Battle already finalized' }, 400);
    }

    // Check if voting period has ended
    if (battle.voting_ends_at) {
      const votingEnd = new Date(battle.voting_ends_at).getTime();
      if (Date.now() < votingEnd) {
        return jsonResponse({ error: 'Voting period has not ended yet' }, 400);
      }
    }

    // Count votes per entry
    const { data: entries } = await supabase
      .from('battle_entries')
      .select('id, user_id, vote_count')
      .eq('battle_id', battle_id)
      .order('vote_count', { ascending: false });

    if (!entries || entries.length === 0) {
      await supabase.from('art_battles').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      }).eq('id', battle_id);

      return jsonResponse({ success: true, winner_id: null, reason: 'no_entries' });
    }

    // Determine winner (highest vote_count)
    const topEntry = entries[0];
    const isTie = entries.length > 1 && entries[0].vote_count === entries[1].vote_count;
    const winnerId = isTie ? null : topEntry.user_id;

    // Update battle atomically — only transition from 'active' to 'completed'
    const { error: updateError } = await supabase.from('art_battles').update({
      status: 'completed',
      winner_id: winnerId,
      completed_at: new Date().toISOString(),
    }).eq('id', battle_id).neq('status', 'completed');

    if (updateError) {
      return jsonResponse({ error: 'Failed to finalize battle' }, 500);
    }

    return jsonResponse({
      success: true,
      winner_id: winnerId,
      is_tie: isTie,
      entries: entries.map(e => ({ id: e.id, user_id: e.user_id, vote_count: e.vote_count })),
    });
  } catch (err) {
    return jsonResponse({ error: 'Internal server error' }, 500);
  }
});
