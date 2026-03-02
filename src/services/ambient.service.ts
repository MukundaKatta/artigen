import { getTasteProfile } from './taste-profile.service';

type TimeOfDay = 'dawn' | 'morning' | 'afternoon' | 'evening' | 'night' | 'midnight';

function getTimeOfDay(): TimeOfDay {
  const h = new Date().getHours();
  if (h >= 5 && h < 7) return 'dawn';
  if (h >= 7 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 20) return 'evening';
  if (h >= 20 && h < 23) return 'night';
  return 'midnight';
}

const TIME_MOODS: Record<TimeOfDay, string[]> = {
  dawn: ['misty sunrise', 'soft golden light', 'awakening', 'pastel sky', 'dewy morning'],
  morning: ['bright and fresh', 'energetic', 'vibrant colors', 'clear skies', 'crisp light'],
  afternoon: ['warm sunlight', 'vivid', 'dynamic', 'lush and detailed', 'high contrast'],
  evening: ['golden hour', 'warm tones', 'long shadows', 'romantic', 'amber glow'],
  night: ['moonlit', 'deep blues', 'city lights', 'mysterious', 'neon accents'],
  midnight: ['dark and ethereal', 'starfield', 'dreamlike', 'deep purple', 'cosmic'],
};

const FALLBACK_STYLES = [
  'cinematic lighting, highly detailed, 8k resolution',
  'digital painting, vibrant colors, trending on artstation',
  'impressionist style, soft brushstrokes, beautiful',
  'cyberpunk aesthetic, neon lights, futuristic',
  'watercolor illustration, delicate textures, serene',
];

export async function buildAmbientPrompt(userId: string): Promise<string> {
  const tod = getTimeOfDay();
  const moods = TIME_MOODS[tod];
  const mood = moods[Math.floor(Math.random() * moods.length)];

  const { data: taste } = await getTasteProfile(userId);

  const stylePool: string[] = taste?.preferred_styles?.length
    ? taste.preferred_styles
    : FALLBACK_STYLES;

  const themePool: string[] = taste?.preferred_themes?.length
    ? taste.preferred_themes
    : ['landscape', 'abstract', 'portrait', 'cityscape', 'nature'];

  const style = stylePool[Math.floor(Math.random() * stylePool.length)];
  const theme = themePool[Math.floor(Math.random() * themePool.length)];

  return `${theme}, ${mood}, ${style}, ambient artwork, no text, award winning`;
}

export type AmbientInterval = 5 | 10 | 15 | 30 | 60;

export const AMBIENT_INTERVALS: { label: string; value: AmbientInterval }[] = [
  { label: '5 min', value: 5 },
  { label: '10 min', value: 10 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hr', value: 60 },
];
