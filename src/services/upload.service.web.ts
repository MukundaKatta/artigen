import { supabase } from '@/lib/supabase';
import { STORAGE_BUCKETS } from '@/lib/constants';

type BucketName = keyof typeof STORAGE_BUCKETS;

/**
 * Web-compatible upload: uses fetch to read blob URLs from the image picker.
 */
export async function uploadFile(
  bucket: BucketName,
  userId: string,
  fileUri: string,
  fileName: string
) {
  const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  const contentType = getContentType(ext);
  const filePath = `${userId}/${Date.now()}_${fileName}`;

  // On web, expo-image-picker returns blob: or data: URIs
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .upload(filePath, blob, {
      contentType,
      upsert: false,
    });

  if (error) return { url: null, error };

  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl, error: null };
}

export async function deleteFile(bucket: BucketName, filePath: string) {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .remove([filePath]);
  return { error };
}

function getContentType(ext: string): string {
  const types: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    mp4: 'video/mp4',
    mov: 'video/quicktime',
  };
  return types[ext] || 'application/octet-stream';
}
