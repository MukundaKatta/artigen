import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';

type PickerOptions = {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  mediaTypes?: ImagePicker.MediaType;
};

export function useImagePicker() {
  const [image, setImage] = useState<ImagePicker.ImagePickerAsset | null>(null);

  async function pickFromGallery(options?: PickerOptions) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return { error: 'Permission to access gallery was denied' };
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: options?.mediaTypes ?? 'images',
      allowsEditing: options?.allowsEditing ?? true,
      aspect: options?.aspect ?? [1, 1],
      quality: options?.quality ?? 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0]);
      return { asset: result.assets[0], error: null };
    }

    return { asset: null, error: null };
  }

  async function takePhoto(options?: PickerOptions) {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      return { error: 'Permission to access camera was denied' };
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: options?.allowsEditing ?? true,
      aspect: options?.aspect ?? [1, 1],
      quality: options?.quality ?? 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0]);
      return { asset: result.assets[0], error: null };
    }

    return { asset: null, error: null };
  }

  function clearImage() {
    setImage(null);
  }

  return { image, pickFromGallery, takePhoto, clearImage };
}
