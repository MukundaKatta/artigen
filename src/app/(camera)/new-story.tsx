import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useAuth } from '@/providers/AuthProvider';
import { useImagePicker } from '@/hooks/useImagePicker';
import { createStory } from '@/services/story.service';
import { showAlert } from '@/utils/alert';
import { Button } from '@/components/ui/Button';
import { SCREEN_WIDTH } from '@/lib/constants';
import { colors, spacing } from '@/lib/theme';

export default function NewStoryRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const { pickFromGallery } = useImagePicker();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [pickerOpened, setPickerOpened] = useState(false);

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

    const { error } = await createStory(user.id, imageUri);
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
        <Button
          title="Share to Story"
          onPress={handleShare}
          loading={sharing}
          size="lg"
          style={styles.shareButton}
        />
      </View>
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
});
