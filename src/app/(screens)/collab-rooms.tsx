import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedPressable } from '@/components/ui/AnimatedPressable';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useCollabRooms, useCollabRoom } from '@/hooks/useCollabRoom';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';
import type { CollabRoom } from '@/services/collab-room.service';

function RoomCard({ room, index }: { room: CollabRoom; index: number }) {
  const router = useRouter();

  const statusColors: Record<string, string> = {
    waiting: '#10B981',
    active: '#F59E0B',
    completed: colors.textSecondary,
  };

  return (
    <Animated.View entering={FadeInUp.delay(index * 80).duration(400)}>
      <AnimatedPressable
        style={styles.roomCard}
        onPress={() => {
          if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push(`/(screens)/collab-room/${room.id}`);
        }}
        scaleValue={0.97}
      >
        <View style={styles.roomHeader}>
          <Avatar uri={room.host_avatar} size={40} />
          <View style={styles.roomInfo}>
            <Text style={styles.roomName} numberOfLines={1}>{room.name}</Text>
            <Text style={styles.roomHost}>Hosted by @{room.host_username}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors[room.status] + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColors[room.status] }]} />
            <Text style={[styles.statusText, { color: statusColors[room.status] }]}>
              {room.status === 'waiting' ? 'Open' : room.status === 'active' ? 'Live' : 'Done'}
            </Text>
          </View>
        </View>

        <Text style={styles.roomPrompt} numberOfLines={2}>{room.prompt}</Text>

        <View style={styles.roomFooter}>
          <View style={styles.roomStat}>
            <Ionicons name="people" size={14} color={colors.textSecondary} />
            <Text style={styles.roomStatText}>
              {room.current_participants}/{room.max_participants}
            </Text>
          </View>
          {room.style && (
            <View style={styles.styleBadge}>
              <Text style={styles.styleBadgeText}>{room.style}</Text>
            </View>
          )}
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

export default function CollabRoomsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { rooms, loading, refresh } = useCollabRooms();
  const { create } = useCollabRoom('');
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrompt, setNewPrompt] = useState('');

  async function handleCreate() {
    if (!newName.trim() || !newPrompt.trim()) return;
    if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const roomId = await create(newName.trim(), newPrompt.trim());
    if (roomId) {
      setShowCreate(false);
      setNewName('');
      setNewPrompt('');
      router.push(`/(screens)/collab-room/${roomId}`);
    }
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedPressable onPress={() => router.back()} scaleValue={0.9}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </AnimatedPressable>
        <Text style={styles.title}>Co-Create Rooms</Text>
        <AnimatedPressable
          onPress={() => {
            if (Platform.OS !== 'web') Haptics.selectionAsync();
            setShowCreate(!showCreate);
          }}
          scaleValue={0.9}
        >
          <Ionicons name={showCreate ? 'close' : 'add-circle'} size={28} color={colors.primary} />
        </AnimatedPressable>
      </View>

      {/* Create Room Form */}
      {showCreate && (
        <Animated.View entering={FadeInUp.duration(300)} style={styles.createForm}>
          <LinearGradient
            colors={['#7C3AED', '#A855F7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.createGradient}
          >
            <Text style={styles.createTitle}>Start a Room</Text>
            <TextInput
              style={styles.createInput}
              placeholder="Room name..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={[styles.createInput, styles.createPromptInput]}
              placeholder="Starting prompt for everyone..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={newPrompt}
              onChangeText={setNewPrompt}
              multiline
            />
            <AnimatedPressable style={styles.createButton} onPress={handleCreate} scaleValue={0.95}>
              <Text style={styles.createButtonText}>Create Room</Text>
              <Ionicons name="arrow-forward" size={18} color="#7C3AED" />
            </AnimatedPressable>
          </LinearGradient>
        </Animated.View>
      )}

      {/* Rooms List */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => <RoomCard room={item} index={index} />}
          contentContainerStyle={styles.list}
          refreshing={false}
          onRefresh={refresh}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>No rooms yet</Text>
              <Text style={styles.emptySubtext}>
                Create a room to collaborate with other artists in real-time
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontFamily: typography.bold,
    color: colors.text,
  },
  createForm: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  createGradient: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  createTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.bold,
    color: '#fff',
  },
  createInput: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    color: '#fff',
    fontSize: fontSize.md,
    fontFamily: typography.regular,
  },
  createPromptInput: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#fff',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  createButtonText: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: '#7C3AED',
  },
  list: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  roomCard: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: fontSize.md,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  roomHost: {
    fontSize: fontSize.xs,
    fontFamily: typography.regular,
    color: colors.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontFamily: typography.semiBold,
  },
  roomPrompt: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  roomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  roomStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roomStatText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  styleBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  styleBadgeText: {
    fontSize: fontSize.xs,
    fontFamily: typography.medium,
    color: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl * 2,
    gap: spacing.md,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontFamily: typography.semiBold,
    color: colors.text,
  },
  emptySubtext: {
    fontSize: fontSize.sm,
    fontFamily: typography.regular,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.xxxl,
  },
});
