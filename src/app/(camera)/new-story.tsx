import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useImagePicker } from '@/hooks/useImagePicker';
import { createStory } from '@/services/story.service';
import { showAlert } from '@/utils/alert';
import { Button } from '@/components/ui/Button';
import { StickerTray } from '@/components/stories/StickerTray';
import { SCREEN_WIDTH } from '@/lib/constants';
import { colors, spacing, fontSize, typography, borderRadius } from '@/lib/theme';

export default function NewStoryRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const { pickFromGallery } = useImagePicker();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [pickerOpened, setPickerOpened] = useState(false);
  const [audience, setAudience] = useState<'everyone' | 'close_friends'>('everyone');
  const [showStickerTray, setShowStickerTray] = useState(false);

  useEffect(() => {
    if (pickerOpened) return;
    setPickerOpened(true);

    (async () => {
      const { asset, error } = await pickFromGallery({
        aspect: [9, 16],
        allowsEditing: true,
      });
      if (error) {
        showAlert('Error', error);
        router.back();
        return;
      }
      if (!asset) {
        router.back();
        return;
      }
      setImageUri(asset.uri);
    })();
  }, []);

  async function handleShare() {
    if (!user?.id || !imageUri) return;
    setSharing(true);

    const { error } = await createStory(user.id, imageUri, 'image', audience);
    setSharing(false);

    if (error) {
      showAlert('Error', 'Failed to share story');
    } else {
      router.back();
    }
  }

  if (!imageUri) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color={colors.textSecondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUri }}
        style={styles.preview}
        contentFit="contain"
      />
      <View style={styles.bottom}>
        {/* Audience toggle */}
        <View style={styles.audienceRow}>
          <TouchableOpacity
            style={[styles.audienceChip, audience === 'everyone' && styles.audienceActive]}
            onPress={() => setAudience('everyone')}
          >
            <Ionicons name="globe-outline" size={14} color={audience === 'everyone' ? '#fff' : colors.textSecondary} />
            <Text style={[styles.audienceText, audience === 'everyone' && styles.audienceTextActive]}>Everyone</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.audienceChip, audience === 'close_friends' && styles.audienceCloseFriends]}
            onPress={() => setAudience('close_friends')}
          >
            <Ionicons name="star" size={14} color={audience === 'close_friends' ? '#fff' : '#22C55E'} />
            <Text style={[styles.audienceText, audience === 'close_friends' && styles.audienceTextActive]}>Close Friends</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stickerButton}
            onPress={() => setShowStickerTray(true)}
          >
            <Ionicons name="happy-outline" size={20} color={colors.textLight} />
          </TouchableOpacity>
        </View>
        <Button
          title="Share to Story"
          onPress={handleShare}
          loading={sharing}
          size="lg"
          style={styles.shareButton}
        />
      </View>
      <StickerTray
        visible={showStickerTray}
        onClose={() => setShowStickerTray(false)}
        onSelect={(type) => {
          // Sticker added - in full impl would add to story after creation
          setShowStickerTray(false);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  bottom: {
    padding: spacing.lg,
    width: '100%',
  },
  shareButton: {
    width: '100%',
  },
  audienceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  audienceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  audienceActive: {
    backgroundColor: colors.primary,
  },
  audienceCloseFriends: {
    backgroundColor: '#22C55E',
  },
  audienceText: {
    fontSize: fontSize.sm,
    fontFamily: typography.medium,
    color: colors.textSecondary,
  },
  audienceTextActive: {
    color: '#fff',
  },
  stickerButton: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
