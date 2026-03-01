import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { battle_id } = await req.json();

    if (!battle_id) {
      return new Response(JSON.stringify({ error: 'battle_id required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Get the battle
    const { data: battle } = await supabase.from('art_battles').select('*').eq('id', battle_id).single();
    if (!battle) {
      return new Response(JSON.stringify({ error: 'Battle not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Check if voting period has ended
    if (battle.voting_ends_at) {
      const votingEnd = new Date(battle.voting_ends_at).getTime();
      if (Date.now() < votingEnd) {
        return new Response(JSON.stringify({ error: 'Voting period has not ended yet' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // Count votes per entry
    const { data: entries } = await supabase
      .from('battle_entries')
      .select('id, user_id, vote_count')
      .eq('battle_id', battle_id)
      .order('vote_count', { ascending: false });

    if (!entries || entries.length === 0) {
      // No entries — mark completed with no winner
      await supabase.from('art_battles').update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      }).eq('id', battle_id);

      return new Response(JSON.stringify({ success: true, winner_id: null, reason: 'no_entries' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Determine winner (highest vote_count)
    const topEntry = entries[0];
    const isTie = entries.length > 1 && entries[0].vote_count === entries[1].vote_count;
    const winnerId = isTie ? null : topEntry.user_id;

    // Update battle
    await supabase.from('art_battles').update({
      status: 'completed',
      winner_id: winnerId,
      completed_at: new Date().toISOString(),
    }).eq('id', battle_id);

    return new Response(JSON.stringify({
      success: true,
      winner_id: winnerId,
      is_tie: isTie,
      entries: entries.map(e => ({ id: e.id, user_id: e.user_id, vote_count: e.vote_count })),
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
