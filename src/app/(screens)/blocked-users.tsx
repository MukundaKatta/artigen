import React, { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Stack } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getBlockedUsers, unblockUser } from '@/services/block.service';
import { colors, fontSize, spacing, typography, borderRadius } from '@/lib/theme';

export default function BlockedUsersRoute() {
  const { user } = useAuth();
  const [blocked, setBlocked] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    getBlockedUsers(user.id).then(({ data }) => {
      setBlocked(data);
    }).catch((err) => {
      logger.warn('Failed to load blocked users:', err);
    }).finally(() => setLoading(false));
  }, [user?.id]);

  async function handleUnblock(blockedId: string) {
    if (!user?.id) return;
    setBlocked((prev) => prev.filter((b) => b.blocked_id !== blockedId));
    await unblockUser(user.id, blockedId);
  }

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Blocked Users' }} />
      <FlatList
        data={blocked}
        keyExtractor={(item) => item.blocked_id}
        renderItem={({ item }) => {
          const profile = item.blocked;
          return (
            <View style={styles.row}>
              <Avatar uri={profile?.avatar_url} size="md" />
              <View style={styles.info}>
                <Text style={styles.username}>{profile?.username}</Text>
                <Text style={styles.fullName}>{profile?.full_name}</Text>
              </View>
              <TouchableOpacity
                style={styles.unblockButton}
                onPress={() => handleUnblock(item.blocked_id)}
              >
                <Text style={styles.unblockText}>Unblock</Text>
              </TouchableOpacity>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>You haven't blocked anyone</Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  username: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  fullName: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  unblockButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  unblockText: {
    fontSize: fontSize.sm,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.text,
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    paddingVertical: spacing.xxxl,
    fontSize: fontSize.md,
  },
});
