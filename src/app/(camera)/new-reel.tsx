import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/providers/AuthProvider';
import { useImagePicker } from '@/hooks/useImagePicker';
import { createPost } from '@/services/post.service';
import { showAlert } from '@/utils/alert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { captionSchema, CaptionFormData } from '@/utils/validation';
import { SCREEN_WIDTH } from '@/lib/constants';
import { colors, spacing } from '@/lib/theme';

export default function NewReelRoute() {
  const router = useRouter();
  const { user } = useAuth();
  const { pickFromGallery } = useImagePicker();
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const [pickerOpened, setPickerOpened] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CaptionFormData>({
    resolver: zodResolver(captionSchema),
    defaultValues: { caption: '', location: '' },
  });

  useEffect(() => {
    if (pickerOpened) return;
    setPickerOpened(true);

    (async () => {
      const { asset, error } = await pickFromGallery({
        mediaTypes: 'videos',
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
      setMediaUri(asset.uri);
    })();
  }, []);

  async function onSubmit(data: CaptionFormData) {
    if (!user?.id || !mediaUri) return;
    setSharing(true);

    const { error } = await createPost({
      userId: user.id,
      caption: data.caption || '',
      location: data.location,
      mediaFiles: [
        {
          uri: mediaUri,
          fileName: `reel_${Date.now()}.mp4`,
          mediaType: 'video',
        },
      ],
    });

    setSharing(false);

    if (error) {
      showAlert('Error', 'Failed to share reel');
    } else {
      router.back();
    }
  }

  if (!mediaUri) {
    return (
      <View style={styles.container}>
        <LoadingSpinner color={colors.textSecondary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: mediaUri }}
        style={styles.preview}
        contentFit="cover"
      />
      <View style={styles.form}>
        <Controller
          control={control}
          name="caption"
          render={({ field: { onChange, value } }) => (
            <Input
              placeholder="Write a caption..."
              multiline
              numberOfLines={3}
              onChangeText={onChange}
              value={value}
              error={errors.caption?.message}
            />
          )}
        />
        <Button
          title="Share Reel"
          onPress={handleSubmit(onSubmit)}
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
    height: SCREEN_WIDTH * (16 / 9) * 0.4,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  form: {
    width: '100%',
    padding: spacing.lg,
  },
  shareButton: {
    marginTop: spacing.md,
  },
});
