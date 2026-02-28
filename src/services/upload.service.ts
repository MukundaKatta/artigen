import { supabase } from '@/lib/supabase';
import * as FileSystem from 'expo-file-system';
import { STORAGE_BUCKETS } from '@/lib/constants';
import { decode } from 'base64-arraybuffer';

type BucketName = keyof typeof STORAGE_BUCKETS;

/**
 * Uploads a file to Supabase Storage.
 * Files are stored in a folder named after the user's ID for security (matches RLS policies).
 */
export async function uploadFile(
  bucket: BucketName,
  userId: string,
  fileUri: string,
  fileName: string
) {
  // Read the file as base64
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Determine the content type from the file extension
  const ext = fileName.split('.').pop()?.toLowerCase() || 'jpg';
  const contentType = getContentType(ext);

  // Create a unique path: userId/timestamp_filename
  const filePath = `${userId}/${Date.now()}_${fileName}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .upload(filePath, decode(base64), {
      contentType,
      upsert: false,
    });

  if (error) return { url: null, error };

  // Get the public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl, error: null };
}

/**
 * Deletes a file from Supabase Storage.
 */
export async function deleteFile(bucket: BucketName, filePath: string) {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .remove([filePath]);
  return { error };
}

/**
 * Downloads a remote URL to a local cache file.
 * Used for AI-generated images (Replicate URLs expire).
 */
export async function downloadToLocal(remoteUrl: string): Promise<string | null> {
  try {
    const localPath = FileSystem.cacheDirectory + `ai_${Date.now()}.png`;
    const { uri } = await FileSystem.downloadAsync(remoteUrl, localPath);
    return uri;
  } catch {
    return null;
  }
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
