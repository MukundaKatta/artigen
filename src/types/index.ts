export type {
  Database,
  Profile,
  Post,
  PostMedia,
  Comment,
  Story,
  Message,
  Notification,
  Conversation,
  PostWithUser,
  CommentWithUser,
  StoryWithUser,
  MessageWithSender,
  NotificationWithSender,
  AiMetadata,
  AiMetadataInsert,
  PostReaction,
  ReactionType,
  ReactionSummary,
  Collection,
  CloseFriend,
  StorySticker,
  StickerResponse,
  PostCollaborator,
  PostView,
  PostInsights,
  Location,
  ProfileTopFriend,
  PromptLibraryItem,
  PromptLibraryInsert,
  PromptSave,
  Repost,
  PostPoll,
  PollOption,
  PollVote,
  DailyChallenge,
  ChallengeEntry,
  ChallengeVote,
  UserNote,
  Badge,
  UserBadge,
  UserStreak,
  Community,
  CommunityMember,
  AwardType,
  PostAward,
} from './database';

// Grouped stories by user (for the story bar)
export type UserStories = {
  userId: string;
  username: string;
  avatarUrl: string | null;
  stories: import('./database').StoryWithUser[];
  hasUnviewed: boolean;
};

// Feed item (post with extra context for the current user)
export type FeedPost = import('./database').PostWithUser & {
  isLiked: boolean;
  isSaved: boolean;
  ai_metadata?: import('./database').AiMetadata | null;
  userReaction?: import('./database').ReactionType | null;
  reactionSummary?: import('./database').ReactionSummary[];
  collaborators?: import('./database').Profile[];
  remixOf?: { id: string; user: Pick<import('./database').Profile, 'id' | 'username' | 'avatar_url'> } | null;
  remixCount?: number;
  isReposted?: boolean;
  repostCount?: number;
  poll?: {
    question: string;
    options: { id: string; text: string; vote_count: number }[];
    userVoteOptionId?: string;
    ends_at?: string;
  } | null;
};

// Conversation with last message preview
export type ConversationPreview = import('./database').Conversation & {
  participants: import('./database').Profile[];
  lastMessage: import('./database').Message | null;
  unreadCount: number;
};

// ── AI Generation Types ───────────────────────────────────────

export type GenerateImageRequest = {
  model_id: string;
  provider: 'replicate' | 'huggingface';
  prompt: string;
  negative_prompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  cfg_scale?: number;
  seed?: number;
  scheduler?: string;
};

export type GenerateImageResponse = {
  image_url: string;
  prediction_id: string;
  generation_time_ms: number;
  model_id: string;
  model_name: string;
  settings: Record<string, unknown>;
};

export type AiModel = {
  id: string;
  name: string;
  description: string;
  category: 'image' | 'video';
  provider: 'replicate' | 'huggingface';
  defaultSettings: {
    steps: number;
    cfg_scale: number;
    width: number;
    height: number;
    scheduler?: string;
  };
  maxSteps: number;
  supportedSchedulers?: string[];
};
