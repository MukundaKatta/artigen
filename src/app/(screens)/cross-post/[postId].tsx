import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useCrossPost } from '@/hooks/useCrossPost';
import { PlatformSelector } from '@/components/cross-post/PlatformSelector';
import { CrossPostStatus } from '@/components/cross-post/CrossPostStatus';
import { Button } from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

export default function CrossPostRoute() {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const { user } = useAuth();
  const { accounts, crossPosts, loading, crossPost, fetchCrossPostStatus } = useCrossPost(user?.id);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [posting, setPosting] = useState(false);
  const [post, setPost] = useState<any>(null);
  const [loadingPost, setLoadingPost] = useState(true);

  useEffect(() => {
    if (!postId) return;
    (async () => {
      const { data } = await supabase
        .from('posts')
        .select('*, media:post_media(*)')
        .eq('id', postId)
        .single();
      setPost(data);
      setLoadingPost(false);
    })();
    fetchCrossPostStatus(postId);
  }, [postId, fetchCrossPostStatus]);

  function handleTogglePlatform(platform: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  }

  async function handleCrossPost() {
    if (!postId || selectedPlatforms.length === 0) return;
    setPosting(true);
    await crossPost(postId, selectedPlatforms);
    setSelectedPlatforms([]);
    // Poll for status updates
    setTimeout(() => fetchCrossPostStatus(postId), 3000);
    setTimeout(() => fetchCrossPostStatus(postId), 6000);
    setPosting(false);
  }

  if (loading || loadingPost) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ title: 'Cross-Post' }} />
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  const imageUrl = post?.media?.[0]?.media_url || post?.media?.[0]?.url;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: 'Cross-Post' }} />

      {/* Post Preview */}
      <View style={styles.postPreview}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.postImage} />
        ) : (
          <View style={[styles.postImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
          </View>
        )}
        <View style={styles.postInfo}>
          <Text style={styles.postCaption} numberOfLines={3}>
            {post?.caption || 'No caption'}
          </Text>
        </View>
      </View>

      {/* Platform Selection */}
      <Text style={styles.sectionTitle}>Select Platforms</Text>
      {accounts.filter((a) => a.is_connected).length === 0 ? (
        <View style={styles.noAccountsBox}>
          <Ionicons name="link-outline" size={24} color={colors.textSecondary} />
          <Text style={styles.noAccountsText}>
            No connected accounts. Go to Cross-Post Settings to connect your social platforms.
          </Text>
        </View>
      ) : (
        <PlatformSelector
          accounts={accounts}
          selectedPlatforms={selectedPlatforms}
          onTogglePlatform={handleTogglePlatform}
        />
      )}

      {/* Post Button */}
      <Button
        title={
          posting
            ? 'Posting...'
            : `Cross-Post to ${selectedPlatforms.length} Platform${selectedPlatforms.length !== 1 ? 's' : ''}`
        }
        onPress={handleCrossPost}
        loading={posting}
        disabled={selectedPlatforms.length === 0}
        size="lg"
        style={styles.postButton}
      />

      {/* Status */}
      {crossPosts.length > 0 && (
        <View style={styles.statusSection}>
          <CrossPostStatus crossPosts={crossPosts} />
        </View>
      )}

      <View style={styles.footer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  postPreview: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.xl,
  },
  postImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
  },
  placeholderImage: {
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  postCaption: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.text,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  noAccountsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
  },
  noAccountsText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  postButton: {
    marginTop: spacing.xl,
  },
  statusSection: {
    marginTop: spacing.xl,
  },
  footer: {
    height: 40,
  },
});
