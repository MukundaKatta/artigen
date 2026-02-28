import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useImagePicker } from '@/hooks/useImagePicker';
import { showAlert } from '@/utils/alert';
import { Button } from '@/components/ui/Button';
import { colors, spacing } from '@/lib/theme';

export default function CameraRoute() {
  const router = useRouter();
  const { takePhoto, pickFromGallery } = useImagePicker();

  async function handleTakePhoto() {
    const { asset, error } = await takePhoto();
    if (error) {
      showAlert('Error', error);
      return;
    }
    if (asset) {
      router.push({
        pathname: '/(camera)/new-post',
        params: {
          imageUri: asset.uri,
          imageWidth: String(asset.width),
          imageHeight: String(asset.height),
        },
      });
    }
  }

  async function handlePickFromGallery() {
    const { asset, error } = await pickFromGallery();
    if (error) {
      showAlert('Error', error);
      return;
    }
    if (asset) {
      router.push({
        pathname: '/(camera)/new-post',
        params: {
          imageUri: asset.uri,
          imageWidth: String(asset.width),
          imageHeight: String(asset.height),
        },
      });
    }
  }

  return (
    <View style={styles.container}>
      <Button
        title="Take Photo"
        onPress={handleTakePhoto}
        size="lg"
        style={styles.button}
      />
      <Button
        title="Choose from Library"
        variant="outline"
        onPress={handlePickFromGallery}
        size="lg"
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundDark,
    paddingHorizontal: spacing.xxxl,
  },
  button: {
    width: '100%',
    marginBottom: spacing.lg,
  },
});
