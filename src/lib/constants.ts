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
