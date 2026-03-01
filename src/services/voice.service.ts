import { supabase } from '@/lib/supabase';
import { uploadFile } from '@/services/upload.service';
import { sendMessage } from '@/services/message.service';

export async function sendVoiceMessage(
  conversationId: string,
  senderId: string,
  audioUri: string,
  durationMs: number
) {
  const fileName = `voice_${Date.now()}.m4a`;
  const { url, error: uploadError } = await uploadFile('messages', senderId, audioUri, fileName);

  if (uploadError || !url) {
    return { data: null, error: uploadError || { message: 'Upload failed' } };
  }

  const content = JSON.stringify({ duration_ms: durationMs });
  return sendMessage(conversationId, senderId, content, 'voice', url);
}

export function parseVoiceDuration(content: string | null): number {
  if (!content) return 0;
  try {
    const parsed = JSON.parse(content);
    return parsed.duration_ms || 0;
  } catch {
    return 0;
  }
}

export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
