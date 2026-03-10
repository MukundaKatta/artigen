import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { useCloseFriends } from '@/hooks/useCloseFriends';
import { Avatar } from '@/components/ui/Avatar';
import { supabase } from '@/lib/supabase';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { Profile } from '@/types';

export default function CloseFriendsRoute() {
  const { user } = useAuth();
  const { friends, friendIds, toggleFriend, loading } = useCloseFriends(user?.id);
  const [followers, setFollowers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    // Load followers as candidates
    Promise.resolve(
      supabase
        .from('follows')
        .select('follower_id, follower:profiles!follower_id(id, username, full_name, avatar_url)')
        .eq('following_id', user.id)
        .eq('status', 'accepted')
    ).then(({ data }) => {
        if (data) {
          setFollowers(data.map((d: any) => d.follower as Profile));
        }
      })
      .catch((err: unknown) => console.warn('Failed to load followers:', err));
  }, [user?.id]);

  const filteredFollowers = searchQuery
    ? followers.filter((f) =>
        f.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : followers;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Close Friends' }} />

      <View style={styles.info}>
        <View style={styles.infoBadge}>
          <Ionicons name="star" size={16} color="#22C55E" />
        </View>
        <Text style={styles.infoText}>
          Share stories and posts exclusively with people you add to your close friends list.
        </Text>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search followers..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {friends.length > 0 && !searchQuery && (
        <Text style={styles.sectionTitle}>Close Friends ({friends.length})</Text>
      )}

      <FlatList
        data={searchQuery ? filteredFollowers : [...friends, ...followers.filter((f) => !friendIds.has(f.id))]}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isClose = friendIds.has(item.id);
          return (
            <View style={styles.row}>
              <Avatar uri={item.avatar_url} size="md" />
              <View style={styles.rowInfo}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.fullName}>{item.full_name}</Text>
              </View>
              <TouchableOpacity
                style={[styles.toggleButton, isClose && styles.toggleActive]}
                onPress={() => toggleFriend(item.id)}
              >
                <Text style={[styles.toggleText, isClose && styles.toggleTextActive]}>
                  {isClose ? 'Remove' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  info: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.backgroundSecondary,
    gap: spacing.md,
    alignItems: 'center',
  },
  infoBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#22C55E20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    fontFamily: typography.regular,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  rowInfo: {
    flex: 1,
  },
  username: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  fullName: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  toggleButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  toggleActive: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.textLight,
  },
  toggleTextActive: {
    color: colors.text,
  },
});
