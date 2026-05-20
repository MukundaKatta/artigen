import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

export type SuggestedUser = Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url' | 'is_verified'> & {
  mutual_count: number;
};

/**
 * Returns a ranked list of users to suggest as follows for the current
 * user, based on second-degree (friend-of-friend) connections and shared
 * interest signals.
 *
 * The ranking is computed by the `get_suggested_users` RPC. Users the
 * current user already follows are excluded server-side. Each result
 * includes `mutual_count` for UI hint ("3 mutual follows").
 *
 * @param userId — the viewer to compute suggestions for
 * @param limit — max suggestions (default 10)
 */
export async function getSuggestedUsers(userId: string, limit = 10) {
  const { data, error } = await supabase.rpc('get_suggested_users', {
    current_user_id: userId,
    result_limit: limit,
  });

  return { data: (data || []) as SuggestedUser[], error };
}
