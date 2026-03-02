import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { Avatar } from '@/components/ui/Avatar';
import { usePromptLibrary } from '@/hooks/usePromptLibrary';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { PromptLibraryItem } from '@/types';

type PromptWithUser = PromptLibraryItem & {
  user: { id: string; username: string; avatar_url: string | null };
};

export default function PromptLibraryRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    prompts,
    loading,
    hasMore,
    searchQuery,
    setSearchQuery,
    loadMore,
    refresh,
    savedPromptIds,
    toggleSave,
  } = usePromptLibrary(user?.id);

  React.useEffect(() => {
    const unsub = router.addListener('focus', () => {
      refresh();
    });
    return unsub;
  }, [router, refresh]);

  function handleUsePrompt(prompt: PromptWithUser) {
    router.push({
      pathname: '/(camera)/generate',
      params: {
        remixPrompt: prompt.prompt,
        remixNegativePrompt: prompt.negative_prompt || '',
        remixModelId: prompt.model_id || '',
        remixSettings: JSON.stringify(prompt.settings || {}),
      },
    });
  }

  function renderPromptCard({ item }: { item: PromptWithUser }) {
    const isSaved = savedPromptIds.has(item.id);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <TouchableOpacity
            style={styles.cardUser}
            onPress={() => router.push(`/(screens)/user/${item.user.id}`)}
          >
            <Avatar uri={item.user.avatar_url} size="sm" />
            <Text style={styles.cardUsername}>{item.user.username}</Text>
          </TouchableOpacity>
          <View style={styles.cardActions}>
            {user && user.id === item.user.id && (
              <TouchableOpacity
                onPress={() => router.push(`/(screens)/prompt-library/edit/${item.id}`)}
                hitSlop={8}
                style={styles.actionIcon}
              >
                <Ionicons name="pencil" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => toggleSave(item.id)} hitSlop={8} style={styles.actionIcon}>
              <Ionicons
                name={isSaved ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isSaved ? colors.primary : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardPrompt} numberOfLines={3}>
          {item.prompt}
        </Text>

        {item.style_tags.length > 0 && (
          <View style={styles.tagsRow}>
            {item.style_tags.slice(0, 4).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.cardFooter}>
          <View style={styles.cardStats}>
            {item.model_name && (
              <Text style={styles.cardStat}>
                <Ionicons name="sparkles" size={10} color="#8B5CF6" /> {item.model_name}
              </Text>
            )}
            <Text style={styles.cardStat}>
              {item.save_count} {item.save_count === 1 ? 'save' : 'saves'}
            </Text>
          </View>
          <TouchableOpacity style={styles.useButton} onPress={() => handleUsePrompt(item)}>
            <Ionicons name="flash" size={14} color="#fff" />
            <Text style={styles.useButtonText}>Use</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search prompts..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
        {user && (
          <TouchableOpacity
            onPress={() => router.push('/(screens)/prompt-library/edit')}
            hitSlop={8}
            style={styles.addButton}
          >
            <Ionicons name="add-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={prompts}
        keyExtractor={(item) => item.id}
        renderItem={renderPromptCard}
        contentContainerStyle={styles.list}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator style={styles.loader} size="large" color={colors.primary} />
          ) : (
            <View style={styles.empty}>
              <Ionicons name="document-text-outline" size={48} color={colors.border} />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No prompts found' : 'No prompts shared yet'}
              </Text>
            </View>
          )
        }
        ListFooterComponent={
          !loading && hasMore ? (
            <ActivityIndicator style={styles.footer} color={colors.primary} />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
    padding: 0,
  },
  addButton: {
    marginLeft: spacing.sm,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  card: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  cardUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    marginLeft: spacing.sm,
  },
  cardUsername: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardPrompt: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: spacing.sm,
  },
  tag: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 10,
    fontFamily: typography.medium,
    color: '#8B5CF6',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardStats: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cardStat: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  useButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  useButtonText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    color: '#fff',
  },
  loader: {
    paddingVertical: spacing.xxxl,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyText: {
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  footer: {
    paddingVertical: spacing.lg,
  },
});
