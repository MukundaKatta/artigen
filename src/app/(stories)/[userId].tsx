import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Keyboard,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/Avatar';
import { getUserStories } from '@/services/story.service';
import { sendStoryReply } from '@/services/message.service';
import { useStoryViewer } from '@/hooks/useStoryViewer';
import { useAuth } from '@/providers/AuthProvider';
import { StickerOverlay } from '@/components/stories/StickerOverlay';
import { useStoryStickers } from '@/hooks/useStoryStickers';
import { timeAgo } from '@/utils/format-date';
import { colors, fontSize, spacing, typography, borderRadius } from '@/lib/theme';
import type { StoryWithUser } from '@/types/database';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function StoryViewerRoute() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [stories, setStories] = useState<StoryWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const isOwnStory = userId === user?.id;

  const {
    currentStory,
    currentIndex,
    progress,
    hasNext,
    next,
    prev,
    pause,
    resume,
  } = useStoryViewer(stories, user?.id || '');

  const { stickers, fetchStickers, respond } = useStoryStickers(currentStory?.id);

  useEffect(() => {
    if (currentStory?.id) fetchStickers();
  }, [currentStory?.id, fetchStickers]);

  useEffect(() => {
    async function load() {
      if (!userId) return;
      const { data } = await getUserStories(userId);
      setStories(data);
      setLoading(false);
    }
    load();
  }, [userId]);

  function handleClose() {
    router.back();
  }

  function handleTapLeft() {
    if (isInputFocused) return;
    prev();
  }

  function handleTapRight() {
    if (isInputFocused) return;
    if (hasNext) {
      next();
    } else {
      handleClose();
    }
  }

  async function handleSendReply() {
    if (!replyText.trim() || !user?.id || !userId || sendingReply) return;
    setSendingReply(true);
    await sendStoryReply(user.id, userId, replyText.trim());
    setReplyText('');
    setSendingReply(false);
    Keyboard.dismiss();
    resume();
  }

  function handleInputFocus() {
    setIsInputFocused(true);
    pause();
  }

  function handleInputBlur() {
    setIsInputFocused(false);
    resume();
  }

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator color={colors.textLight} style={styles.loader} />
      </View>
    );
  }

  if (!currentStory) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={styles.emptyText}>No stories available</Text>
        <TouchableOpacity onPress={handleClose} style={[styles.closeEmpty, { top: insets.top + spacing.md }]}>
          <Ionicons name="close" size={28} color={colors.textLight} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Story image */}
      <Image
        source={{ uri: currentStory.media_url }}
        style={styles.storyImage}
        contentFit="cover"
        transition={200}
      />

      {/* Overlay */}
      <View style={[styles.overlay, { paddingTop: insets.top + spacing.sm }]}>
        {/* Progress bars */}
        <View style={styles.progressContainer}>
          {stories.map((_, i) => (
            <View key={i} style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width:
                      i < currentIndex
                        ? '100%'
                        : i === currentIndex
                          ? `${progress * 100}%`
                          : '0%',
                  },
                ]}
              />
            </View>
          ))}
        </View>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Avatar uri={currentStory.user.avatar_url} size="sm" />
            <Text style={styles.username}>{currentStory.user.username}</Text>
            <Text style={styles.timestamp}>{timeAgo(currentStory.created_at)}</Text>
          </View>
          <TouchableOpacity onPress={handleClose} hitSlop={12}>
            <Ionicons name="close" size={28} color={colors.textLight} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Story Stickers */}
      {stickers.length > 0 && (
        <StickerOverlay
          stickers={stickers}
          userId={user?.id || ''}
          onRespond={(stickerId: string, response: Record<string, unknown>) =>
            respond(stickerId, user?.id || '', response)
          }
        />
      )}

      {/* Tap zones */}
      <View style={styles.tapZones}>
        <Pressable
          style={styles.tapLeft}
          onPress={handleTapLeft}
          onLongPress={pause}
          onPressOut={resume}
        />
        <Pressable
          style={styles.tapRight}
          onPress={handleTapRight}
          onLongPress={pause}
          onPressOut={resume}
        />
      </View>

      {/* Story reply input (only for other users' stories) */}
      {!isOwnStory && (
        <View style={[styles.replyBar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
          <TextInput
            ref={inputRef}
            style={styles.replyInput}
            placeholder={`Reply to ${currentStory.user.username}...`}
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={replyText}
            onChangeText={setReplyText}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            returnKeyType="send"
            onSubmitEditing={handleSendReply}
          />
          {replyText.trim() ? (
            <TouchableOpacity onPress={handleSendReply} disabled={sendingReply} hitSlop={8}>
              <Ionicons name="send" size={24} color="#fff" />
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  storyImage: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: spacing.sm,
  },
  progressTrack: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.textLight,
    borderRadius: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    color: colors.textLight,
    fontFamily: typography.semiBold,
    fontWeight: '600',
    fontSize: fontSize.md,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    marginLeft: spacing.sm,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: fontSize.sm,
    marginLeft: spacing.sm,
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 5,
  },
  tapLeft: {
    flex: 1,
  },
  tapRight: {
    flex: 2,
  },
  loader: {
    flex: 1,
  },
  emptyText: {
    color: colors.textLight,
    fontSize: fontSize.lg,
    textAlign: 'center',
    marginTop: SCREEN_HEIGHT / 2 - 20,
  },
  closeEmpty: {
    position: 'absolute',
    right: spacing.lg,
  },
  replyBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    zIndex: 20,
  },
  replyInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.md,
    fontSize: fontSize.md,
    color: '#fff',
    marginRight: spacing.sm,
  },
});
