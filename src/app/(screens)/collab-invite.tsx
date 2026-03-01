import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { getPendingInvites, respondToInvite } from '@/services/collaboration.service';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

export default function CollabInviteRoute() {
  const { user } = useAuth();
  const router = useRouter();
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    getPendingInvites(user.id).then(({ data }) => {
      setInvites(data);
      setLoading(false);
    });
  }, [user?.id]);

  async function handleRespond(postId: string, accept: boolean) {
    if (!user?.id) return;
    await respondToInvite(postId, user.id, accept);
    setInvites((prev) => prev.filter((i) => i.post_id !== postId));
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Collaboration Invites' }} />
      <FlatList
        data={invites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const post = item.post;
          const media = (post?.media || []).sort((a: any, b: any) => a.sort_order - b.sort_order);
          const firstMedia = media[0];

          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Avatar uri={post?.user?.avatar_url} size="md" />
                <View style={styles.cardInfo}>
                  <Text style={styles.username}>{post?.user?.username}</Text>
                  <Text style={styles.inviteText}>invited you to collaborate</Text>
                </View>
                {firstMedia && (
                  <Image source={{ uri: firstMedia.media_url }} style={styles.thumbnail} contentFit="cover" />
                )}
              </View>
              {post?.caption ? (
                <Text style={styles.caption} numberOfLines={2}>{post.caption}</Text>
              ) : null}
              <View style={styles.actions}>
                <Button
                  title="Accept"
                  size="sm"
                  onPress={() => handleRespond(item.post_id, true)}
                  style={styles.acceptButton}
                />
                <Button
                  title="Decline"
                  variant="outline"
                  size="sm"
                  onPress={() => handleRespond(item.post_id, false)}
                  style={styles.declineButton}
                />
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.empty}>
              <Ionicons name="people-outline" size={48} color={colors.border} />
              <Text style={styles.emptyTitle}>No pending invites</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  card: {
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  username: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  inviteText: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  caption: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.text,
    marginTop: spacing.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  acceptButton: {
    flex: 1,
  },
  declineButton: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.lg,
  },
});
