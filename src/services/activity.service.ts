import { supabase } from '@/lib/supabase';

export async function updateLastActive(userId: string) {
  const { error } = await supabase
    .from('profiles')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', userId);
  return { error };
}

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
