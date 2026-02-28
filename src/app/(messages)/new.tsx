import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
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
        <ActivityIndicator style={styles.loader} color={colors.textSecondary} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListEmptyComponent={
            query.trim() ? (
              <Text style={styles.emptyText}>No users found</Text>
            ) : (
              <Text style={styles.emptyText}>Search for people to message</Text>
            )
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
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: fontSize.md,
    marginTop: spacing.xxxl,
  },
});
