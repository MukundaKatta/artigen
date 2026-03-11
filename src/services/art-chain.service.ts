import { supabase } from '@/lib/supabase';

export type ArtChainLink = {
  id: string;
  position: number;
  user_id: string;
  username: string;
  avatar_url: string;
  image_url: string;
  prompt_used: string;
  likes_count: number;
  created_at: string;
};

export type ArtChain = {
  id: string;
  title: string;
  description: string;
  theme: string;
  starter_id: string;
  starter_username: string;
  total_links: number;
  total_participants: number;
  total_likes: number;
  status: 'open' | 'completed' | 'featured';
  max_links: number;
  links: ArtChainLink[];
  created_at: string;
};

export async function createArtChain(
  userId: string,
  title: string,
  description: string,
  theme: string,
  firstImageUrl: string,
  firstPrompt: string,
  maxLinks: number = 20,
): Promise<string | null> {
  const { data: chain, error } = await (supabase
    .from('art_chains') as any)
    .insert({
      title,
      description,
      theme,
      starter_id: userId,
      max_links: maxLinks,
      status: 'open',
    })
    .select('id')
    .single();

  if (error || !chain) return null;

  // Add first link
  await (supabase.from('art_chain_links') as any).insert({
    chain_id: (chain as { id: string }).id,
    user_id: userId,
    position: 1,
    image_url: firstImageUrl,
    prompt_used: firstPrompt,
  });

  return (chain as { id: string }).id;
}

export async function addChainLink(
  chainId: string,
  userId: string,
  imageUrl: string,
  promptUsed: string,
): Promise<boolean> {
  // Get current position
  const { count } = await (supabase
    .from('art_chain_links') as any)
    .select('id', { count: 'exact', head: true })
    .eq('chain_id', chainId);

  const nextPosition = (count || 0) + 1;

  const { error } = await (supabase.from('art_chain_links') as any).insert({
    chain_id: chainId,
    user_id: userId,
    position: nextPosition,
    image_url: imageUrl,
    prompt_used: promptUsed,
  });

  return !error;
}

export async function fetchArtChains(status?: string): Promise<ArtChain[]> {
  let query = (supabase
    .from('art_chains') as any)
    .select(`
      *,
      starter:profiles!starter_id(username, avatar_url),
      links:art_chain_links(count)
    `)
    .order('created_at', { ascending: false })
    .limit(20);

  if (status) query = query.eq('status', status);

  const { data } = await query;

  return ((data || []) as Record<string, any>[]).map((chain) => ({
    ...chain,
    starter_username: chain.starter?.username || '',
    total_links: chain.links?.[0]?.count || 0,
    total_participants: 0,
    total_likes: 0,
    links: [],
  })) as unknown as ArtChain[];
}

export async function fetchArtChain(chainId: string): Promise<ArtChain | null> {
  const { data } = await (supabase
    .from('art_chains') as any)
    .select(`
      *,
      starter:profiles!starter_id(username, avatar_url),
      links:art_chain_links(
        id, position, image_url, prompt_used, likes_count, created_at, user_id,
        user:profiles(username, avatar_url)
      )
    `)
    .eq('id', chainId)
    .single();

  if (!data) return null;

  const chainData = data as Record<string, any>;
  const links: ArtChainLink[] = (chainData.links || [])
    .sort((a: Record<string, number>, b: Record<string, number>) => a.position - b.position)
    .map((link: Record<string, unknown>) => ({
      ...link,
      username: (link.user as Record<string, string>)?.username || '',
      avatar_url: (link.user as Record<string, string>)?.avatar_url || '',
    }));

  return {
    ...chainData,
    starter_username: chainData.starter?.username || '',
    total_links: links.length,
    total_participants: new Set(links.map((l) => l.user_id)).size,
    total_likes: links.reduce((sum, l) => sum + (l.likes_count || 0), 0),
    links,
  } as ArtChain;
}
