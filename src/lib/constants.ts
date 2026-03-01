import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const SCREEN_WIDTH = width;
export const SCREEN_HEIGHT = height;

// Grid layout for profile posts (3 columns)
export const POST_GRID_GAP = 2;
export const POST_GRID_COLUMNS = 3;
export const POST_GRID_SIZE = (SCREEN_WIDTH - POST_GRID_GAP * (POST_GRID_COLUMNS - 1)) / POST_GRID_COLUMNS;

// Pagination
export const FEED_PAGE_SIZE = 10;
export const EXPLORE_PAGE_SIZE = 30;
export const COMMENTS_PAGE_SIZE = 20;
export const MESSAGES_PAGE_SIZE = 30;
export const NOTIFICATIONS_PAGE_SIZE = 20;

// Story
export const STORY_DURATION_SECONDS = 5;
export const STORY_CIRCLE_SIZE = 66;

// Avatar sizes
export const AVATAR_SIZES = {
  sm: 28,
  md: 40,
  lg: 56,
  xl: 86,
} as const;

// Max upload sizes
export const MAX_IMAGE_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_MB = 100;
export const MAX_VIDEO_DURATION_SECONDS = 60; // For reels

// Storage bucket names
export const STORAGE_BUCKETS = {
  avatars: 'avatars',
  posts: 'posts',
  stories: 'stories',
  messages: 'messages',
} as const;

// Tip presets (in cents)
export const TIP_PRESETS = [100, 200, 500, 1000, 2000] as const;

// Taste profile options
export const STYLE_OPTIONS: string[] = [
  'Photorealistic', 'Anime', 'Oil Painting', 'Watercolor', 'Digital Art',
  'Pixel Art', 'Abstract', 'Minimalist', 'Surreal', 'Pop Art',
  'Sketch', 'Comic Book', '3D Render', 'Cinematic', 'Impressionist',
];

export const THEME_OPTIONS: string[] = [
  'Nature', 'Sci-Fi', 'Fantasy', 'Urban', 'Portraits',
  'Animals', 'Architecture', 'Food', 'Space', 'Underwater',
  'Steampunk', 'Cyberpunk', 'Historical', 'Horror', 'Whimsical',
];

export const PALETTE_OPTIONS: string[] = [
  'Warm', 'Cool', 'Pastel', 'Neon', 'Monochrome',
  'Earth Tones', 'Vibrant', 'Dark', 'Light', 'Muted',
];

export const MARKETPLACE_PAGE_SIZE = 20;
export const TRANSACTIONS_PAGE_SIZE = 20;
