import { supabase } from '@/lib/supabase';
import { readAsStringAsync, EncodingType, cacheDirectory, downloadAsync } from 'expo-file-system';
import { STORAGE_BUCKETS, MAX_IMAGE_SIZE_MB, MAX_VIDEO_SIZE_MB } from '@/lib/constants';
import { decode } from 'base64-arraybuffer';

type BucketName = keyof typeof STORAGE_BUCKETS;

const ALLOWED_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'mov']);
const IMAGE_EXTENSIONS = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp']);

/**
 * Uploads a file to Supabase Storage.
 * Files are stored in a folder named after the user's ID for security (matches RLS policies).
 * Validates file extension and size before uploading.
 */
export async function uploadFile(
  bucket: BucketName,
  userId: string,
  fileUri: string,
  fileName: string,
) {
  // Validate file extension
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      url: null,
      error: {
        message: `File type ".${ext}" is not allowed. Accepted: ${[...ALLOWED_EXTENSIONS].join(', ')}`,
      },
    };
  }

  // Sanitize filename — strip path traversal and special characters
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Read the file as base64
  const base64 = await readAsStringAsync(fileUri, {
    encoding: EncodingType.Base64,
  });

  // Validate file size
  const sizeBytes = (base64.length * 3) / 4; // approximate decoded size
  const maxBytes = IMAGE_EXTENSIONS.has(ext)
    ? MAX_IMAGE_SIZE_MB * 1024 * 1024
    : MAX_VIDEO_SIZE_MB * 1024 * 1024;
  if (sizeBytes > maxBytes) {
    const maxMB = IMAGE_EXTENSIONS.has(ext) ? MAX_IMAGE_SIZE_MB : MAX_VIDEO_SIZE_MB;
    return { url: null, error: { message: `File exceeds ${maxMB}MB size limit` } };
  }

  const contentType = getContentType(ext);

  // Create a unique path: userId/timestamp_filename
  const filePath = `${userId}/${Date.now()}_${sanitizedName}`;

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .upload(filePath, decode(base64), {
      contentType,
      upsert: false,
    });

  if (error) return { url: null, error };

  // Get the public URL
  const { data: urlData } = supabase.storage.from(STORAGE_BUCKETS[bucket]).getPublicUrl(data.path);

  return { url: urlData.publicUrl, error: null };
}

/**
 * Deletes a file from Supabase Storage.
 */
export async function deleteFile(bucket: BucketName, filePath: string) {
  const { error } = await supabase.storage.from(STORAGE_BUCKETS[bucket]).remove([filePath]);
  return { error };
}

/**
 * Downloads a remote URL to a local cache file.
 * Used for AI-generated images (Replicate URLs expire).
 */
export async function downloadToLocal(remoteUrl: string): Promise<string | null> {
  try {
    const localPath = cacheDirectory + `ai_${Date.now()}.png`;
    const { uri } = await downloadAsync(remoteUrl, localPath);
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
