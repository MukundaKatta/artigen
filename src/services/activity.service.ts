import { supabase } from '@/lib/supabase';

/**
 * Touch the current user's `profiles.last_active_at` to the current
 * timestamp. Call from the activity heartbeat hook (`useActivityStatus`)
 * roughly every 5 minutes while the app is foregrounded. Cheap single
 * UPDATE; safe to fire-and-forget — the caller can ignore the result.
 */
export async function updateLastActive(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', userId);
  return { error };
}

/**
 * Privacy toggle: when `show=false`, the user's last-active timestamp is
 * still recorded server-side but hidden from other users via the RLS
 * policy on `profiles.last_active_at`. The current user always sees their
 * own status regardless of this setting.
 */
export async function toggleActivityStatus(userId: string, show: boolean) {
  const { error } = await supabase
    .from('profiles')
    .update({ show_activity_status: show })
    .eq('id', userId);
  return { error };
}

export function getActivityText(lastActiveAt: string | null | undefined): string {
  if (!lastActiveAt) return '';

  const diff = Date.now() - new Date(lastActiveAt).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return 'Active now';
  if (minutes < 60) return `Active ${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Active ${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `Active ${days}d ago`;

  return '';
}
