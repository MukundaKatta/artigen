import { useCallback, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useDebouncedCallback } from '@/hooks/useDebounce';

export type SpotlightResult = {
  id: string;
  type: 'user' | 'post' | 'community' | 'challenge' | 'action' | 'screen';
  title: string;
  subtitle: string;
  icon: string;
  route: string;
  imageUrl?: string;
};

// Quick actions that don't require search
const QUICK_ACTIONS: SpotlightResult[] = [
  { id: 'qa-generate', type: 'action', title: 'Generate Art', subtitle: 'Create new AI artwork', icon: 'sparkles', route: '/(camera)/generate' },
  { id: 'qa-camera', type: 'action', title: 'Camera', subtitle: 'Take a photo to transform', icon: 'camera', route: '/(camera)/camera' },
  { id: 'qa-restyle', type: 'action', title: 'Restyle', subtitle: 'Transform an existing image', icon: 'color-wand', route: '/(camera)/restyle' },
  { id: 'qa-inpaint', type: 'action', title: 'Inpaint', subtitle: 'Edit specific areas of an image', icon: 'brush', route: '/(camera)/inpaint' },
  { id: 'qa-animate', type: 'action', title: 'Animate', subtitle: 'Bring images to life', icon: 'play-circle', route: '/(camera)/animate' },
  { id: 'qa-3d', type: 'action', title: 'Text to 3D', subtitle: 'Generate 3D models from text', icon: 'cube', route: '/(screens)/text-to-3d' },
  { id: 'qa-wrapped', type: 'screen', title: 'Art Wrapped', subtitle: 'Your year in review', icon: 'gift', route: '/(screens)/wrapped' },
  { id: 'qa-evolution', type: 'screen', title: 'Style Evolution', subtitle: 'Track your creative journey', icon: 'analytics', route: '/(screens)/style-evolution' },
  { id: 'qa-ranks', type: 'screen', title: 'Creator Ranks', subtitle: 'View your level and perks', icon: 'ribbon', route: '/(screens)/ranks' },
  { id: 'qa-chains', type: 'screen', title: 'Art Chains', subtitle: 'Collaborative evolving art', icon: 'link', route: '/(screens)/art-chains' },
  { id: 'qa-collab', type: 'screen', title: 'Co-Create Rooms', subtitle: 'Real-time art sessions', icon: 'people', route: '/(screens)/collab-rooms' },
  { id: 'qa-moodboard', type: 'screen', title: 'Mood Boards', subtitle: 'Visual inspiration boards', icon: 'color-palette', route: '/(screens)/mood-boards' },
  { id: 'qa-challenges', type: 'screen', title: 'Challenges', subtitle: 'Daily & weekly challenges', icon: 'trophy', route: '/(screens)/challenges' },
  { id: 'qa-battles', type: 'screen', title: 'Art Battles', subtitle: 'Head-to-head competitions', icon: 'flash', route: '/(screens)/battles' },
  { id: 'qa-prompts', type: 'screen', title: 'Prompt Library', subtitle: 'Browse and save prompts', icon: 'library', route: '/(screens)/prompt-library' },
  { id: 'qa-tutorials', type: 'screen', title: 'Tutorials', subtitle: 'Learn AI art techniques', icon: 'school', route: '/(screens)/tutorials' },
  { id: 'qa-marketplace', type: 'screen', title: 'Marketplace', subtitle: 'Buy and sell AI art', icon: 'storefront', route: '/(screens)/marketplace/create-listing' },
  { id: 'qa-wallet', type: 'screen', title: 'Wallet', subtitle: 'View balance and transactions', icon: 'wallet', route: '/(screens)/wallet' },
  { id: 'qa-settings', type: 'screen', title: 'Settings', subtitle: 'App preferences', icon: 'settings', route: '/(screens)/settings' },
  { id: 'qa-profile', type: 'screen', title: 'My Profile', subtitle: 'View and edit profile', icon: 'person', route: '/(tabs)/profile' },
];

export function useSpotlightSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SpotlightResult[]>([]);
  const [loading, setLoading] = useState(false);

  // Network search debounced to 300ms — every keystroke updates `query`
  // immediately for input responsiveness but the Supabase round-trip only
  // fires after the user pauses typing.
  const runNetworkSearch = useDebouncedCallback(async (searchQuery: string) => {
    setLoading(true);
    const q = searchQuery.toLowerCase();

    // Filter quick actions first
    const actionResults = QUICK_ACTIONS.filter(
      (a) => a.title.toLowerCase().includes(q) || a.subtitle.toLowerCase().includes(q),
    );

    // Search users.
    // NOTE: `display_name` is not in the generated database type for `profiles`,
    // so we narrow the select result via `.returns<T[]>()` rather than casting
    // the whole query builder to `any`.
    type ProfileRow = { id: string; username: string; display_name: string | null; avatar_url: string | null };
    const { data: users } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url')
      .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`)
      .limit(5)
      .returns<ProfileRow[]>();

    const userResults: SpotlightResult[] = (users || []).map((u) => ({
      id: `user-${u.id}`,
      type: 'user' as const,
      title: u.display_name || u.username,
      subtitle: `@${u.username}`,
      icon: 'person',
      route: `/(screens)/user/${u.id}`,
      imageUrl: u.avatar_url || undefined,
    }));

    // Search communities
    const { data: communities } = await supabase
      .from('communities')
      .select('id, name, description')
      .ilike('name', `%${searchQuery}%`)
      .limit(3);

    const communityResults: SpotlightResult[] = (communities || []).map((c) => ({
      id: `community-${c.id}`,
      type: 'community' as const,
      title: c.name,
      subtitle: c.description?.substring(0, 50) || 'Community',
      icon: 'people-circle',
      route: `/(screens)/community/${c.id}`,
    }));

    setResults([...actionResults, ...userResults, ...communityResults].slice(0, 15));
    setLoading(false);
  }, 300);

  const search = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
      if (!searchQuery.trim()) {
        setResults(QUICK_ACTIONS.slice(0, 8));
        return;
      }
      runNetworkSearch(searchQuery);
    },
    [runNetworkSearch],
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults(QUICK_ACTIONS.slice(0, 8));
  }, []);

  return { query, results, loading, search, clearSearch };
}
