import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

export type SuggestedUser = Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url' | 'is_verified'> & {
  mutual_count: number;
};

export async function getSuggestedUsers(userId: string, limit = 10) {
  const { data, error } = await supabase.rpc('get_suggested_users', {
    current_user_id: userId,
    result_limit: limit,
  });

  return { data: (data || []) as SuggestedUser[], error };
}
