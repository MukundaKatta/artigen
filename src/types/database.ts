// This file defines TypeScript types matching your Supabase database schema.
// In production, you can auto-generate this with: npx supabase gen types typescript
// For now, we define them manually to match our schema.

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          avatar_url: string | null;
          bio: string;
          website: string;
          is_private: boolean;
          is_verified: boolean;
          theme_preference: 'system' | 'light' | 'dark';
          followers_count: number;
          following_count: number;
          posts_count: number;
          push_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string;
          avatar_url?: string | null;
          bio?: string;
          website?: string;
          is_private?: boolean;
          is_verified?: boolean;
          theme_preference?: 'system' | 'light' | 'dark';
          followers_count?: number;
          following_count?: number;
          posts_count?: number;
          push_token?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          full_name?: string;
          avatar_url?: string | null;
          bio?: string;
          website?: string;
          is_private?: boolean;
          theme_preference?: 'system' | 'light' | 'dark';
          push_token?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          status: 'accepted' | 'pending';
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          status?: 'accepted' | 'pending';
          created_at?: string;
        };
        Update: {
          status?: 'accepted' | 'pending';
        };
        Relationships: [];
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          caption: string;
          post_type: 'image' | 'video' | 'carousel' | 'reel';
          location: string | null;
          is_archived: boolean;
          is_comments_disabled: boolean;
          is_pinned: boolean;
          pinned_at: string | null;
          likes_count: number;
          comments_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          caption?: string;
          post_type?: 'image' | 'video' | 'carousel' | 'reel';
          location?: string | null;
          is_archived?: boolean;
          is_comments_disabled?: boolean;
          is_pinned?: boolean;
          pinned_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          caption?: string;
          location?: string | null;
          is_archived?: boolean;
          is_comments_disabled?: boolean;
          is_pinned?: boolean;
          pinned_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      post_media: {
        Row: {
          id: string;
          post_id: string;
          media_url: string;
          media_type: string;
          thumbnail_url: string | null;
          width: number | null;
          height: number | null;
          duration_seconds: number | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          media_url: string;
          media_type?: string;
          thumbnail_url?: string | null;
          width?: number | null;
          height?: number | null;
          duration_seconds?: number | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          sort_order?: number;
        };
        Relationships: [];
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          parent_comment_id: string | null;
          content: string;
          likes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          parent_comment_id?: string | null;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      comment_likes: {
        Row: {
          id: string;
          user_id: string;
          comment_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          comment_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      stories: {
        Row: {
          id: string;
          user_id: string;
          media_url: string;
          media_type: string;
          duration_seconds: number;
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          media_url: string;
          media_type?: string;
          duration_seconds?: number;
          created_at?: string;
          expires_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      story_views: {
        Row: {
          id: string;
          story_id: string;
          viewer_id: string;
          viewed_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          viewer_id: string;
          viewed_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      hashtags: {
        Row: {
          id: string;
          name: string;
          post_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          post_count?: number;
          created_at?: string;
        };
        Update: {
          post_count?: number;
        };
        Relationships: [];
      };
      post_hashtags: {
        Row: {
          id: string;
          post_id: string;
          hashtag_id: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          hashtag_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      saved_posts: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          is_group: boolean;
          group_name: string | null;
          group_avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          is_group?: boolean;
          group_name?: string | null;
          group_avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          group_name?: string | null;
          group_avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversation_participants: {
        Row: {
          id: string;
          conversation_id: string;
          user_id: string;
          joined_at: string;
          last_read_at: string | null;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          user_id: string;
          joined_at?: string;
          last_read_at?: string | null;
        };
        Update: {
          last_read_at?: string | null;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string | null;
          message_type: 'text' | 'image' | 'video' | 'post_share' | 'story_reply';
          media_url: string | null;
          shared_post_id: string | null;
          is_deleted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content?: string | null;
          message_type?: 'text' | 'image' | 'video' | 'post_share' | 'story_reply';
          media_url?: string | null;
          shared_post_id?: string | null;
          is_deleted?: boolean;
          created_at?: string;
        };
        Update: {
          is_deleted?: boolean;
        };
        Relationships: [];
      };
      user_blocks: {
        Row: {
          id: string;
          blocker_id: string;
          blocked_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          blocker_id: string;
          blocked_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_user_id: string | null;
          reported_post_id: string | null;
          reason: string;
          details: string | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_user_id?: string | null;
          reported_post_id?: string | null;
          reason: string;
          details?: string | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          status?: string;
        };
        Relationships: [];
      };
      story_highlights: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          cover_url: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          cover_url?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          cover_url?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      story_highlight_items: {
        Row: {
          id: string;
          highlight_id: string;
          story_id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          highlight_id: string;
          story_id: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          sort_order?: number;
        };
        Relationships: [];
      };
      message_reactions: {
        Row: {
          id: string;
          message_id: string;
          user_id: string;
          emoji: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          message_id: string;
          user_id: string;
          emoji: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      ai_metadata: {
        Row: {
          id: string;
          post_id: string;
          source: 'generated' | 'uploaded';
          provider: string;
          model_id: string;
          model_name: string;
          prompt: string;
          negative_prompt: string;
          style_tags: string[];
          settings: Record<string, unknown>;
          generation_time_ms: number | null;
          replicate_prediction_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          source?: 'generated' | 'uploaded';
          provider?: string;
          model_id: string;
          model_name: string;
          prompt: string;
          negative_prompt?: string;
          style_tags?: string[];
          settings?: Record<string, unknown>;
          generation_time_ms?: number | null;
          replicate_prediction_id?: string | null;
          created_at?: string;
        };
        Update: {
          prompt?: string;
          negative_prompt?: string;
          style_tags?: string[];
          settings?: Record<string, unknown>;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          recipient_id: string;
          sender_id: string;
          notification_type: 'like' | 'comment' | 'follow' | 'follow_request' | 'mention' | 'story_reply' | 'comment_like';
          post_id: string | null;
          comment_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          sender_id: string;
          notification_type: 'like' | 'comment' | 'follow' | 'follow_request' | 'mention' | 'story_reply' | 'comment_like';
          post_id?: string | null;
          comment_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          is_read?: boolean;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_suggested_users: {
        Args: {
          current_user_id: string;
          result_limit: number;
        };
        Returns: {
          id: string;
          username: string;
          full_name: string;
          avatar_url: string | null;
          is_verified: boolean;
          mutual_count: number;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Helper types for easier use throughout the app
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type PostMedia = Database['public']['Tables']['post_media']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type Story = Database['public']['Tables']['stories']['Row'];
export type Message = Database['public']['Tables']['messages']['Row'];
export type Notification = Database['public']['Tables']['notifications']['Row'];
export type Conversation = Database['public']['Tables']['conversations']['Row'];
export type AiMetadata = Database['public']['Tables']['ai_metadata']['Row'];
export type AiMetadataInsert = Database['public']['Tables']['ai_metadata']['Insert'];

// Extended types with relationships (what you get from joins)
export type PostWithUser = Post & {
  user: Profile;
  media: PostMedia[];
};

export type CommentWithUser = Comment & {
  user: Profile;
  likes_count: number;
  isLiked?: boolean;
  replies_count?: number;
  replies?: CommentWithUser[];
};

export type StoryWithUser = Story & {
  user: Pick<Profile, 'id' | 'username' | 'avatar_url'>;
  views: { viewer_id: string }[];
};

export type MessageWithSender = Message & {
  sender: Profile;
};

export type NotificationWithSender = Notification & {
  sender: Profile;
};
