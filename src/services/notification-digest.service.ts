import { supabase } from '@/lib/supabase';

export type DigestGroup = {
  type: 'likes' | 'follows' | 'comments' | 'mentions' | 'challenges' | 'milestones';
  title: string;
  subtitle: string;
  count: number;
  icon: string;
  color: string;
  preview: { username: string; avatar: string }[];
  postId?: string;
  postImageUrl?: string;
};

export type NotificationDigest = {
  groups: DigestGroup[];
  totalUnread: number;
  lastDigestAt: string;
  highlights: string[]; // e.g. "Your post reached 100 likes!"
};

export async function fetchNotificationDigest(userId: string): Promise<NotificationDigest> {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  type NotificationRow = {
    id: string;
    type: string;
    created_at: string;
    read: boolean;
    actor: { username: string; avatar_url: string } | null;
    post: { id: string; media: { media_url: string }[] } | null;
  };

  const { data: notifications } = await (supabase
    .from('notifications') as any)
    .select(`
      id, type, created_at, read,
      actor:profiles!actor_id(username, avatar_url),
      post:posts(id, media:post_media(media_url))
    `)
    .eq('user_id', userId)
    .gte('created_at', oneDayAgo)
    .order('created_at', { ascending: false });

  const items = (notifications || []) as NotificationRow[];
  const totalUnread = items.filter((n) => !n.read).length;

  // Group by type
  const grouped: Record<string, { items: typeof items; postIds: Set<string> }> = {};
  items.forEach((n) => {
    const key = n.type;
    if (!grouped[key]) grouped[key] = { items: [], postIds: new Set() };
    grouped[key].items.push(n);
    if (n.post?.id) grouped[key].postIds.add(n.post.id);
  });

  const typeConfig: Record<string, { title: string; icon: string; color: string }> = {
    like: { title: 'Likes', icon: 'heart', color: '#FF6B6B' },
    follow: { title: 'New Followers', icon: 'person-add', color: '#0095F6' },
    comment: { title: 'Comments', icon: 'chatbubble', color: '#10B981' },
    mention: { title: 'Mentions', icon: 'at', color: '#8B5CF6' },
    challenge: { title: 'Challenges', icon: 'trophy', color: '#F59E0B' },
    badge: { title: 'Achievements', icon: 'ribbon', color: '#EC4899' },
    remix: { title: 'Remixes', icon: 'git-branch-outline', color: '#6366F1' },
    tip: { title: 'Tips Received', icon: 'cash-outline', color: '#10B981' },
  };

  const groups: DigestGroup[] = Object.entries(grouped)
    .map(([type, { items: typeItems }]) => {
      const config = typeConfig[type] || { title: type, icon: 'notifications', color: colors_primary };
      const preview = typeItems
        .slice(0, 3)
        .map((n) => ({
          username: (n.actor as { username: string })?.username || '',
          avatar: (n.actor as { avatar_url: string })?.avatar_url || '',
        }));

      const firstPost = typeItems.find((n) => n.post);
      const postMedia = firstPost?.post?.media as { media_url: string }[] | undefined;

      let subtitle: string;
      if (typeItems.length === 1) {
        subtitle = `@${preview[0]?.username} ${getActionVerb(type)} your post`;
      } else if (typeItems.length === 2) {
        subtitle = `@${preview[0]?.username} and @${preview[1]?.username}`;
      } else {
        subtitle = `@${preview[0]?.username} and ${typeItems.length - 1} others`;
      }

      return {
        type: type as DigestGroup['type'],
        title: config.title,
        subtitle,
        count: typeItems.length,
        icon: config.icon,
        color: config.color,
        preview,
        postId: firstPost?.post?.id,
        postImageUrl: postMedia?.[0]?.media_url,
      };
    })
    .sort((a, b) => b.count - a.count);

  // Generate highlights
  const highlights: string[] = [];
  const likeGroup = groups.find((g) => g.type === 'likes');
  if (likeGroup && likeGroup.count >= 10) {
    highlights.push(`Your art received ${likeGroup.count} likes today!`);
  }
  const followGroup = groups.find((g) => g.type === 'follows');
  if (followGroup && followGroup.count >= 5) {
    highlights.push(`${followGroup.count} new people discovered your art!`);
  }
  if (groups.some((g) => g.type === 'milestones')) {
    highlights.push('You unlocked a new achievement!');
  }

  return {
    groups,
    totalUnread,
    lastDigestAt: new Date().toISOString(),
    highlights,
  };
}

const colors_primary = '#0095F6';

function getActionVerb(type: string): string {
  switch (type) {
    case 'like': return 'liked';
    case 'follow': return 'followed';
    case 'comment': return 'commented on';
    case 'mention': return 'mentioned you in';
    case 'remix': return 'remixed';
    case 'tip': return 'tipped';
    default: return 'interacted with';
  }
}
