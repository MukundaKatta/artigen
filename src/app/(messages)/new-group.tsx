import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/providers/AuthProvider';
import { Avatar } from '@/components/ui/Avatar';
import { searchUsers } from '@/services/profile.service';
import { supabase } from '@/lib/supabase';
import { colors, fontSize, spacing, typography, borderRadius } from '@/lib/theme';

export default function NewGroupRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selected, setSelected] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleSearch = useCallback(async (text: string) => {
    setQuery(text);
    if (text.length < 2) {
      setUsers([]);
      return;
    }
    setSearching(true);
    const { data } = await searchUsers(text);
    setUsers((data || []).filter((u: any) => u.id !== user?.id));
    setSearching(false);
  }, [user?.id]);

  function toggleSelect(profile: any) {
    setSelected((prev) =>
      prev.find((p) => p.id === profile.id)
        ? prev.filter((p) => p.id !== profile.id)
        : [...prev, profile]
    );
  }

  async function handleCreate() {
    if (selected.length < 2 || !user?.id || !groupName.trim()) return;
    setCreating(true);

    // Create group conversation
    const { data: conv, error } = await supabase
      .from('conversations')
      .insert({
        is_group: true,
        group_name: groupName.trim(),
      })
      .select()
      .single();

    if (error || !conv) {
      setCreating(false);
      return;
    }

    // Add all participants including self
    const participants = [...selected.map((p) => p.id), user.id];
    await supabase.from('conversation_participants').insert(
      participants.map((uid) => ({
        conversation_id: (conv as any).id,
        user_id: uid,
      }))
    );

    setCreating(false);
    router.replace(`/(messages)/${(conv as any).id}`);
  }

  const isSelected = (id: string) => selected.some((p) => p.id === id);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'New Group',
          headerRight: () => (
            <TouchableOpacity
              onPress={handleCreate}
              disabled={selected.length < 2 || !groupName.trim() || creating}
            >
              <Text style={[styles.createButton, (selected.length < 2 || !groupName.trim()) && { opacity: 0.4 }]}>
                {creating ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <TextInput
        style={styles.nameInput}
        placeholder="Group name"
        placeholderTextColor={colors.textSecondary}
        value={groupName}
        onChangeText={setGroupName}
      />

      {/* Selected chips */}
      {selected.length > 0 && (
        <View style={styles.selectedContainer}>
          {selected.map((p) => (
            <TouchableOpacity key={p.id} style={styles.chip} onPress={() => toggleSelect(p)}>
              <Avatar uri={p.avatar_url} size="sm" />
              <Text style={styles.chipText}>{p.username}</Text>
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search people..."
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={handleSearch}
        />
      </View>

      {searching && <ActivityIndicator style={{ padding: spacing.md }} color={colors.textSecondary} />}

      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.userRow} onPress={() => toggleSelect(item)}>
            <Avatar uri={item.avatar_url} size="md" />
            <View style={styles.userInfo}>
              <Text style={styles.username}>{item.username}</Text>
              <Text style={styles.fullName}>{item.full_name}</Text>
            </View>
            <View style={[styles.checkbox, isSelected(item.id) && styles.checkboxSelected]}>
              {isSelected(item.id) && <Ionicons name="checkmark" size={14} color="#fff" />}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  nameInput: {
    fontSize: fontSize.lg,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  selectedContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    paddingRight: spacing.sm,
    gap: spacing.xs,
  },
  chipText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.text,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    marginLeft: spacing.sm,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  userInfo: {
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
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  createButton: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    color: colors.primary,
  },
});
