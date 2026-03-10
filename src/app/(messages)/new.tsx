import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { searchUsers } from '@/services/profile.service';
import { getOrCreateConversation } from '@/services/message.service';
import { Avatar } from '@/components/ui/Avatar';
import { colors, spacing, fontSize, typography } from '@/lib/theme';
import type { Profile } from '@/types';

type UserResult = Pick<Profile, 'id' | 'username' | 'full_name' | 'avatar_url' | 'is_verified'>;

export default function NewMessageRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      const { data } = await searchUsers(text.trim());
      setResults((data || []).filter((u) => u.id !== user?.id));
      setSearching(false);
    }, 300);
  }, [user?.id]);

  async function handleSelectUser(selectedUserId: string) {
    if (!user?.id || creating) return;
    setCreating(true);

    const { data: conv } = await getOrCreateConversation(user.id, selectedUserId);
    setCreating(false);

    if (conv) {
      router.replace(`/(messages)/${conv.id}`);
    }
  }

  function renderItem({ item }: { item: UserResult }) {
    return (
      <TouchableOpacity
        style={styles.userRow}
        onPress={() => handleSelectUser(item.id)}
      >
        <Avatar uri={item.avatar_url} size="md" />
        <View style={styles.userInfo}>
          <View style={styles.usernameRow}>
            <Text style={styles.username}>{item.username}</Text>
            {item.is_verified && (
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} style={{ marginLeft: 4 }} />
            )}
          </View>
          <Text style={styles.fullName} numberOfLines={1}>{item.full_name}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'New Message' }} />

      <TouchableOpacity
        style={styles.groupButton}
        onPress={() => router.push('/(messages)/new-group')}
      >
        <View style={styles.groupIconContainer}>
          <Ionicons name="people" size={22} color={colors.primary} />
        </View>
        <Text style={styles.groupButtonText}>Create a Group</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <View style={styles.searchBar}>
        <Text style={styles.toLabel}>To:</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoFocus
        />
      </View>

      {creating || searching ? (
        <View style={styles.loader}><LoadingSpinner /></View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name={query.trim() ? 'person-outline' : 'search-outline'}
                  size={28}
                  color={colors.textSecondary}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {query.trim() ? 'No users found' : 'Find someone'}
              </Text>
              <Text style={styles.emptyText}>
                {query.trim() ? 'Try a different search term' : 'Search for people to message'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  toLabel: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: 0,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  userInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  usernameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  fullName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  loader: {
    marginTop: spacing.xxxl,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  groupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  groupIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupButtonText: {
    flex: 1,
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
    marginLeft: spacing.md,
  },
});
