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
          show_activity_status: boolean;
          last_active_at: string;
          profile_theme: Record<string, unknown>;
          interest_tags: string[];
          subscriber_count: number;
          is_creator: boolean;
          portfolio_enabled: boolean;
          portfolio_bio: string | null;
          portfolio_contact_email: string | null;
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
          show_activity_status?: boolean;
          last_active_at?: string;
          profile_theme?: Record<string, unknown>;
          interest_tags?: string[];
          subscriber_count?: number;
          is_creator?: boolean;
          portfolio_enabled?: boolean;
          portfolio_bio?: string | null;
          portfolio_contact_email?: string | null;
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
          show_activity_status?: boolean;
          last_active_at?: string;
          profile_theme?: Record<string, unknown>;
          interest_tags?: string[];
          subscriber_count?: number;
          is_creator?: boolean;
          portfolio_enabled?: boolean;
          portfolio_bio?: string | null;
          portfolio_contact_email?: string | null;
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
          location_id: string | null;
          is_archived: boolean;
          is_comments_disabled: boolean;
          is_pinned: boolean;
          pinned_at: string | null;
          likes_count: number;
          comments_count: number;
          views_count: number;
          repost_count: number;
          audience: 'everyone' | 'close_friends';
          scheduled_at: string | null;
          is_draft: boolean;
          remix_of_post_id: string | null;
          community_id: string | null;
          has_listing: boolean;
          has_provenance: boolean;
          subscription_tier_id: string | null;
          music_url: string | null;
          music_title: string | null;
          is_critique_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          caption?: string;
          post_type?: 'image' | 'video' | 'carousel' | 'reel';
          location?: string | null;
          location_id?: string | null;
          is_archived?: boolean;
          is_comments_disabled?: boolean;
          is_pinned?: boolean;
          pinned_at?: string | null;
          repost_count?: number;
          audience?: 'everyone' | 'close_friends';
          scheduled_at?: string | null;
          is_draft?: boolean;
          remix_of_post_id?: string | null;
          community_id?: string | null;
          has_listing?: boolean;
          has_provenance?: boolean;
          subscription_tier_id?: string | null;
          music_url?: string | null;
          music_title?: string | null;
          is_critique_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          caption?: string;
          location?: string | null;
          location_id?: string | null;
          is_archived?: boolean;
          is_comments_disabled?: boolean;
          is_pinned?: boolean;
          pinned_at?: string | null;
          audience?: 'everyone' | 'close_friends';
          scheduled_at?: string | null;
          is_draft?: boolean;
          remix_of_post_id?: string | null;
          community_id?: string | null;
          has_listing?: boolean;
          has_provenance?: boolean;
          subscription_tier_id?: string | null;
          music_url?: string | null;
          music_title?: string | null;
          is_critique_enabled?: boolean;
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
      post_reactions: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          reaction_type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'fire' | 'clap';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          reaction_type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'fire' | 'clap';
          created_at?: string;
        };
        Update: {
          reaction_type?: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'fire' | 'clap';
        };
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
          audience: 'everyone' | 'close_friends';
          created_at: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          media_url: string;
          media_type?: string;
          duration_seconds?: number;
          audience?: 'everyone' | 'close_friends';
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
      story_stickers: {
        Row: {
          id: string;
          story_id: string;
          sticker_type: 'poll' | 'quiz' | 'question' | 'emoji_slider' | 'countdown' | 'link';
          config: Record<string, unknown>;
          position_x: number;
          position_y: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          story_id: string;
          sticker_type: 'poll' | 'quiz' | 'question' | 'emoji_slider' | 'countdown' | 'link';
          config?: Record<string, unknown>;
          position_x?: number;
          position_y?: number;
          created_at?: string;
        };
        Update: {
          config?: Record<string, unknown>;
          position_x?: number;
          position_y?: number;
        };
        Relationships: [];
      };
      story_sticker_responses: {
        Row: {
          id: string;
          sticker_id: string;
          user_id: string;
          response: Record<string, unknown>;
          created_at: string;
        };
        Insert: {
          id?: string;
          sticker_id: string;
          user_id: string;
          response?: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          response?: Record<string, unknown>;
        };
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
          collection_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          collection_id?: string | null;
          created_at?: string;
        };
        Update: {
          collection_id?: string | null;
        };
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          cover_url: string | null;
          post_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          cover_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          cover_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      close_friends: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
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
          is_vanish_mode: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          is_group?: boolean;
          group_name?: string | null;
          group_avatar_url?: string | null;
          is_vanish_mode?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          group_name?: string | null;
          group_avatar_url?: string | null;
          is_vanish_mode?: boolean;
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
          message_type: 'text' | 'image' | 'video' | 'post_share' | 'story_reply' | 'voice';
          media_url: string | null;
          shared_post_id: string | null;
          is_deleted: boolean;
          is_ephemeral: boolean;
          seen_by: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content?: string | null;
          message_type?: 'text' | 'image' | 'video' | 'post_share' | 'story_reply' | 'voice';
          media_url?: string | null;
          shared_post_id?: string | null;
          is_deleted?: boolean;
          is_ephemeral?: boolean;
          seen_by?: string[];
          created_at?: string;
        };
        Update: {
          is_deleted?: boolean;
          is_ephemeral?: boolean;
          seen_by?: string[];
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
          notification_type: 'like' | 'comment' | 'follow' | 'follow_request' | 'mention' | 'story_reply' | 'comment_like' | 'collab_invite' | 'collab_accepted' | 'subscription' | 'tip' | 'community_invite' | 'community_post' | 'prompt_remix';
          post_id: string | null;
          comment_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipient_id: string;
          sender_id: string;
          notification_type: 'like' | 'comment' | 'follow' | 'follow_request' | 'mention' | 'story_reply' | 'comment_like' | 'collab_invite' | 'collab_accepted' | 'subscription' | 'tip' | 'community_invite' | 'community_post' | 'prompt_remix';
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
      post_collaborators: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          status: 'pending' | 'accepted' | 'declined';
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          status?: 'pending' | 'accepted' | 'declined';
          created_at?: string;
        };
        Update: {
          status?: 'pending' | 'accepted' | 'declined';
        };
        Relationships: [];
      };
      post_views: {
        Row: {
          id: string;
          post_id: string;
          viewer_id: string | null;
          source: 'feed' | 'profile' | 'explore' | 'hashtag' | 'search' | 'share';
          viewed_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          viewer_id?: string | null;
          source?: 'feed' | 'profile' | 'explore' | 'hashtag' | 'search' | 'share';
          viewed_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      locations: {
        Row: {
          id: string;
          name: string;
          address: string | null;
          lat: number | null;
          lng: number | null;
          post_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
        };
        Update: {
          name?: string;
          address?: string | null;
          lat?: number | null;
          lng?: number | null;
        };
        Relationships: [];
      };
      profile_top_friends: {
        Row: {
          id: string;
          user_id: string;
          friend_id: string;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          friend_id: string;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          sort_order?: number;
        };
        Relationships: [];
      };
      prompt_library: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          prompt: string;
          negative_prompt: string;
          model_id: string | null;
          model_name: string | null;
          settings: Record<string, unknown>;
          style_tags: string[];
          use_count: number;
          save_count: number;
          is_public: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          prompt: string;
          negative_prompt?: string;
          model_id?: string | null;
          model_name?: string | null;
          settings?: Record<string, unknown>;
          style_tags?: string[];
          is_public?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          prompt?: string;
          negative_prompt?: string;
          model_id?: string | null;
          model_name?: string | null;
          settings?: Record<string, unknown>;
          style_tags?: string[];
          is_public?: boolean;
        };
        Relationships: [];
      };
      prompt_saves: {
        Row: {
          id: string;
          user_id: string;
          prompt_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      reposts: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          quote_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          quote_text?: string | null;
          created_at?: string;
        };
        Update: {
          quote_text?: string | null;
        };
        Relationships: [];
      };
      post_polls: {
        Row: {
          id: string;
          post_id: string;
          question: string;
          ends_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          question: string;
          ends_at?: string | null;
          created_at?: string;
        };
        Update: {
          question?: string;
          ends_at?: string | null;
        };
        Relationships: [];
      };
      poll_options: {
        Row: {
          id: string;
          poll_id: string;
          text: string;
          vote_count: number;
          position: number;
        };
        Insert: {
          id?: string;
          poll_id: string;
          text: string;
          vote_count?: number;
          position?: number;
        };
        Update: {
          text?: string;
          vote_count?: number;
          position?: number;
        };
        Relationships: [];
      };
      poll_votes: {
        Row: {
          id: string;
          poll_id: string;
          option_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          option_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      daily_challenges: {
        Row: {
          id: string;
          prompt_theme: string;
          description: string | null;
          date: string;
          style_suggestion: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          prompt_theme: string;
          description?: string | null;
          date: string;
          style_suggestion?: string | null;
          created_at?: string;
        };
        Update: {
          prompt_theme?: string;
          description?: string | null;
          date?: string;
          style_suggestion?: string | null;
        };
        Relationships: [];
      };
      challenge_entries: {
        Row: {
          id: string;
          challenge_id: string;
          post_id: string;
          user_id: string;
          vote_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          post_id: string;
          user_id: string;
          vote_count?: number;
          created_at?: string;
        };
        Update: {
          vote_count?: number;
        };
        Relationships: [];
      };
      challenge_votes: {
        Row: {
          id: string;
          entry_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          entry_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      challenges: {
        Row: {
          id: string;
          title: string;
          description: string;
          prompt_hint: string;
          cover_url: string | null;
          challenge_type: 'daily' | 'weekly' | 'monthly' | 'special';
          starts_at: string;
          ends_at: string;
          is_active: boolean;
          entry_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string;
          prompt_hint: string;
          cover_url?: string | null;
          challenge_type?: 'daily' | 'weekly' | 'monthly' | 'special';
          starts_at: string;
          ends_at: string;
          is_active?: boolean;
          entry_count?: number;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          prompt_hint?: string;
          cover_url?: string | null;
          challenge_type?: 'daily' | 'weekly' | 'monthly' | 'special';
          starts_at?: string;
          ends_at?: string;
          is_active?: boolean;
          entry_count?: number;
        };
        Relationships: [];
      };
      user_notes: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          emoji: string | null;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          emoji?: string | null;
          expires_at?: string;
          created_at?: string;
        };
        Update: {
          content?: string;
          emoji?: string | null;
          expires_at?: string;
        };
        Relationships: [];
      };
      badges: {
        Row: {
          id: string;
          name: string;
          description: string;
          icon: string;
          category: string;
          threshold: number;
        };
        Insert: {
          id: string;
          name: string;
          description: string;
          icon: string;
          category?: string;
          threshold?: number;
        };
        Update: {
          name?: string;
          description?: string;
          icon?: string;
          category?: string;
          threshold?: number;
        };
        Relationships: [];
      };
      user_badges: {
        Row: {
          id: string;
          user_id: string;
          badge_id: string;
          earned_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          badge_id: string;
          earned_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      user_streaks: {
        Row: {
          id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_post_date: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_post_date?: string | null;
          updated_at?: string;
        };
        Update: {
          current_streak?: number;
          longest_streak?: number;
          last_post_date?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      creation_streaks: {
        Row: {
          id: string;
          user_id: string;
          current_streak: number;
          longest_streak: number;
          last_creation_date: string | null;
          total_challenges_completed: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          current_streak?: number;
          longest_streak?: number;
          last_creation_date?: string | null;
          total_challenges_completed?: number;
          updated_at?: string;
        };
        Update: {
          current_streak?: number;
          longest_streak?: number;
          last_creation_date?: string | null;
          total_challenges_completed?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      communities: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          avatar_url: string | null;
          cover_url: string | null;
          owner_id: string;
          member_count: number;
          is_private: boolean;
          rules: string[];
          tags: string[];
          slug: string | null;
          post_count: number;
          custom_reactions: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          owner_id: string;
          member_count?: number;
          is_private?: boolean;
          rules?: string[];
          tags?: string[];
          slug?: string | null;
          post_count?: number;
          custom_reactions?: string[];
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          avatar_url?: string | null;
          cover_url?: string | null;
          member_count?: number;
          is_private?: boolean;
          rules?: string[];
          tags?: string[];
          slug?: string | null;
          post_count?: number;
          custom_reactions?: string[];
        };
        Relationships: [];
      };
      community_members: {
        Row: {
          id: string;
          community_id: string;
          user_id: string;
          role: 'owner' | 'moderator' | 'member';
          joined_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          user_id: string;
          role?: 'owner' | 'moderator' | 'member';
          joined_at?: string;
        };
        Update: {
          role?: 'owner' | 'moderator' | 'member';
        };
        Relationships: [];
      };
      award_types: {
        Row: {
          id: string;
          name: string;
          emoji: string;
          description: string;
          tier: 'bronze' | 'silver' | 'gold' | 'diamond';
          sort_order: number;
        };
        Insert: {
          id: string;
          name: string;
          emoji: string;
          description: string;
          tier?: 'bronze' | 'silver' | 'gold' | 'diamond';
          sort_order?: number;
        };
        Update: {
          name?: string;
          emoji?: string;
          description?: string;
          tier?: 'bronze' | 'silver' | 'gold' | 'diamond';
          sort_order?: number;
        };
        Relationships: [];
      };
      post_awards: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          award_type_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          award_type_id: string;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      subscription_tiers: {
        Row: {
          id: string;
          creator_id: string;
          name: string;
          description: string;
          price_cents: number;
          currency: string;
          benefits: unknown;
          badge_label: string | null;
          badge_color: string;
          is_active: boolean;
          max_subscribers: number | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          name: string;
          description?: string;
          price_cents: number;
          currency?: string;
          benefits?: unknown;
          badge_label?: string | null;
          badge_color?: string;
          is_active?: boolean;
          max_subscribers?: number | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          price_cents?: number;
          currency?: string;
          benefits?: unknown;
          badge_label?: string | null;
          badge_color?: string;
          is_active?: boolean;
          max_subscribers?: number | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscriptions: {
        Row: {
          id: string;
          subscriber_id: string;
          creator_id: string;
          tier_id: string | null;
          status: 'active' | 'cancelled' | 'expired' | 'paused';
          started_at: string;
          expires_at: string | null;
          cancelled_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscriber_id: string;
          creator_id: string;
          tier_id?: string | null;
          status?: 'active' | 'cancelled' | 'expired' | 'paused';
          started_at?: string;
          expires_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
        };
        Update: {
          status?: 'active' | 'cancelled' | 'expired' | 'paused';
          tier_id?: string | null;
          expires_at?: string | null;
          cancelled_at?: string | null;
        };
        Relationships: [];
      };
      wallets: {
        Row: {
          id: string;
          user_id: string;
          balance_cents: number;
          lifetime_earned_cents: number;
          lifetime_spent_cents: number;
          currency: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          balance_cents?: number;
          lifetime_earned_cents?: number;
          lifetime_spent_cents?: number;
          currency?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          balance_cents?: number;
          lifetime_earned_cents?: number;
          lifetime_spent_cents?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      wallet_transactions: {
        Row: {
          id: string;
          wallet_id: string;
          type: 'deposit' | 'withdrawal' | 'tip_sent' | 'tip_received' | 'purchase' | 'sale' | 'subscription_payment' | 'subscription_earning';
          amount_cents: number;
          fee_cents: number;
          counterparty_id: string | null;
          post_id: string | null;
          description: string;
          status: 'pending' | 'completed' | 'failed' | 'refunded';
          external_ref: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          type: 'deposit' | 'withdrawal' | 'tip_sent' | 'tip_received' | 'purchase' | 'sale' | 'subscription_payment' | 'subscription_earning';
          amount_cents: number;
          fee_cents?: number;
          counterparty_id?: string | null;
          post_id?: string | null;
          description?: string;
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          external_ref?: string | null;
          created_at?: string;
        };
        Update: {
          status?: 'pending' | 'completed' | 'failed' | 'refunded';
          description?: string;
        };
        Relationships: [];
      };
      tips: {
        Row: {
          id: string;
          sender_id: string;
          recipient_id: string;
          post_id: string | null;
          amount_cents: number;
          message: string;
          transaction_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          recipient_id: string;
          post_id?: string | null;
          amount_cents: number;
          message?: string;
          transaction_id?: string | null;
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      marketplace_listings: {
        Row: {
          id: string;
          post_id: string;
          seller_id: string;
          listing_type: 'digital_download' | 'print_on_demand';
          title: string;
          description: string;
          price_cents: number;
          currency: string;
          digital_file_url: string | null;
          digital_file_size_bytes: number | null;
          print_options: unknown;
          is_active: boolean;
          sales_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          seller_id: string;
          listing_type: 'digital_download' | 'print_on_demand';
          title: string;
          description?: string;
          price_cents: number;
          currency?: string;
          digital_file_url?: string | null;
          digital_file_size_bytes?: number | null;
          print_options?: unknown;
          is_active?: boolean;
          sales_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          price_cents?: number;
          digital_file_url?: string | null;
          print_options?: unknown;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string;
          seller_id: string;
          listing_id: string;
          order_type: 'digital_download' | 'print_on_demand';
          status: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          amount_cents: number;
          fee_cents: number;
          print_config: unknown;
          shipping_address: unknown;
          tracking_number: string | null;
          download_url: string | null;
          download_expires_at: string | null;
          transaction_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          buyer_id: string;
          seller_id: string;
          listing_id: string;
          order_type: 'digital_download' | 'print_on_demand';
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          amount_cents: number;
          fee_cents?: number;
          print_config?: unknown;
          shipping_address?: unknown;
          tracking_number?: string | null;
          download_url?: string | null;
          download_expires_at?: string | null;
          transaction_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          status?: 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          tracking_number?: string | null;
          download_url?: string | null;
          download_expires_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      post_embeddings: {
        Row: {
          id: string;
          post_id: string;
          embedding: unknown;
          model_version: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          embedding: unknown;
          model_version?: string;
          created_at?: string;
        };
        Update: {
          embedding?: unknown;
          model_version?: string;
        };
        Relationships: [];
      };
      taste_profiles: {
        Row: {
          id: string;
          user_id: string;
          preferred_styles: string[];
          preferred_models: string[];
          preferred_themes: string[];
          preferred_palettes: string[];
          disliked_styles: string[];
          disliked_themes: string[];
          engagement_weights: unknown;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          preferred_styles?: string[];
          preferred_models?: string[];
          preferred_themes?: string[];
          preferred_palettes?: string[];
          disliked_styles?: string[];
          disliked_themes?: string[];
          engagement_weights?: unknown;
          updated_at?: string;
        };
        Update: {
          preferred_styles?: string[];
          preferred_models?: string[];
          preferred_themes?: string[];
          preferred_palettes?: string[];
          disliked_styles?: string[];
          disliked_themes?: string[];
          engagement_weights?: unknown;
          updated_at?: string;
        };
        Relationships: [];
      };
      engagement_signals: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          signal_type: 'view' | 'like' | 'save' | 'comment' | 'share' | 'long_view' | 'skip';
          weight: number;
          style_tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          signal_type: 'view' | 'like' | 'save' | 'comment' | 'share' | 'long_view' | 'skip';
          weight?: number;
          style_tags?: string[];
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      blend_feeds: {
        Row: {
          id: string;
          user_a_id: string;
          user_b_id: string;
          conversation_id: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_a_id: string;
          user_b_id: string;
          conversation_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          is_active?: boolean;
          conversation_id?: string | null;
        };
        Relationships: [];
      };
      style_presets: {
        Row: {
          id: string;
          name: string;
          description: string;
          preview_url: string | null;
          prompt_modifier: string;
          model_id: string;
          settings: unknown;
          category: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          preview_url?: string | null;
          prompt_modifier: string;
          model_id: string;
          settings?: unknown;
          category?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          name?: string;
          description?: string;
          preview_url?: string | null;
          prompt_modifier?: string;
          model_id?: string;
          settings?: unknown;
          category?: string;
          sort_order?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      restyle_jobs: {
        Row: {
          id: string;
          user_id: string;
          source_post_id: string | null;
          source_image_url: string;
          style_preset_id: string | null;
          custom_style_prompt: string | null;
          result_image_url: string | null;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          result_post_id: string | null;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_post_id?: string | null;
          source_image_url: string;
          style_preset_id?: string | null;
          custom_style_prompt?: string | null;
          result_image_url?: string | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          result_post_id?: string | null;
          error_message?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          result_image_url?: string | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          result_post_id?: string | null;
          error_message?: string | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      animation_jobs: {
        Row: {
          id: string;
          user_id: string;
          source_post_id: string | null;
          source_image_url: string;
          animation_type: 'motion' | 'camera_pan' | 'parallax' | 'zoom' | 'morph';
          settings: unknown;
          result_video_url: string | null;
          thumbnail_url: string | null;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          result_post_id: string | null;
          error_message: string | null;
          duration_seconds: number;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_post_id?: string | null;
          source_image_url: string;
          animation_type: 'motion' | 'camera_pan' | 'parallax' | 'zoom' | 'morph';
          settings?: unknown;
          result_video_url?: string | null;
          thumbnail_url?: string | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          result_post_id?: string | null;
          error_message?: string | null;
          duration_seconds?: number;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          result_video_url?: string | null;
          thumbnail_url?: string | null;
          status?: 'pending' | 'processing' | 'completed' | 'failed';
          result_post_id?: string | null;
          error_message?: string | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      prompt_remixes: {
        Row: {
          id: string;
          original_post_id: string;
          remixed_post_id: string;
          original_prompt: string;
          modified_prompt: string;
          original_author_id: string | null;
          remixer_id: string;
          changes_description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          original_post_id: string;
          remixed_post_id: string;
          original_prompt: string;
          modified_prompt: string;
          original_author_id?: string | null;
          remixer_id: string;
          changes_description?: string;
          created_at?: string;
        };
        Update: {
          changes_description?: string;
        };
        Relationships: [];
      };
      art_provenance: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          content_hash: string;
          prompt_hash: string | null;
          model_id: string | null;
          model_name: string | null;
          generation_date: string;
          signature: string;
          c2pa_manifest: unknown;
          verification_status: 'verified' | 'unverified' | 'tampered';
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          content_hash: string;
          prompt_hash?: string | null;
          model_id?: string | null;
          model_name?: string | null;
          generation_date: string;
          signature: string;
          c2pa_manifest?: unknown;
          verification_status?: 'verified' | 'unverified' | 'tampered';
          created_at?: string;
        };
        Update: {
          verification_status?: 'verified' | 'unverified' | 'tampered';
          c2pa_manifest?: unknown;
        };
        Relationships: [];
      };
      content_labels: {
        Row: {
          id: string;
          post_id: string;
          label_type: 'safe' | 'sensitive' | 'mature' | 'nsfw';
          ai_confidence: number | null;
          ai_categories: unknown;
          is_ai_labeled: boolean;
          is_overridden: boolean;
          override_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          label_type: 'safe' | 'sensitive' | 'mature' | 'nsfw';
          ai_confidence?: number | null;
          ai_categories?: unknown;
          is_ai_labeled?: boolean;
          is_overridden?: boolean;
          override_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          label_type?: 'safe' | 'sensitive' | 'mature' | 'nsfw';
          ai_confidence?: number | null;
          ai_categories?: unknown;
          is_overridden?: boolean;
          override_by?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_ratings: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          rating: 'safe' | 'sensitive' | 'mature' | 'nsfw';
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          rating: 'safe' | 'sensitive' | 'mature' | 'nsfw';
          created_at?: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      safety_preferences: {
        Row: {
          id: string;
          user_id: string;
          show_sensitive: boolean;
          show_mature: boolean;
          blur_nsfw: boolean;
          age_verified: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          show_sensitive?: boolean;
          show_mature?: boolean;
          blur_nsfw?: boolean;
          age_verified?: boolean;
          updated_at?: string;
        };
        Update: {
          show_sensitive?: boolean;
          show_mature?: boolean;
          blur_nsfw?: boolean;
          age_verified?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      community_posts: {
        Row: {
          id: string;
          community_id: string;
          post_id: string;
          posted_by: string;
          is_pinned: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          community_id: string;
          post_id: string;
          posted_by: string;
          is_pinned?: boolean;
          created_at?: string;
        };
        Update: {
          is_pinned?: boolean;
        };
        Relationships: [];
      };

      // === BATCH 1: AI Creation Tools ===
      inpainting_jobs: {
        Row: {
          id: string;
          user_id: string;
          source_post_id: string | null;
          source_image_url: string;
          mask_image_url: string;
          prompt: string;
          negative_prompt: string | null;
          model_id: string;
          settings: Record<string, unknown>;
          result_image_url: string | null;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          result_post_id: string | null;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_post_id?: string | null;
          source_image_url: string;
          mask_image_url: string;
          prompt: string;
          negative_prompt?: string | null;
          model_id?: string;
          settings?: Record<string, unknown>;
          status?: string;
        };
        Update: {
          status?: string;
          result_image_url?: string | null;
          result_post_id?: string | null;
          error_message?: string | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      outpainting_jobs: {
        Row: {
          id: string;
          user_id: string;
          source_post_id: string | null;
          source_image_url: string;
          direction: 'left' | 'right' | 'up' | 'down' | 'all';
          expand_pixels: number;
          prompt: string | null;
          model_id: string;
          settings: Record<string, unknown>;
          result_image_url: string | null;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          result_post_id: string | null;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_post_id?: string | null;
          source_image_url: string;
          direction: 'left' | 'right' | 'up' | 'down' | 'all';
          expand_pixels?: number;
          prompt?: string | null;
          model_id?: string;
          settings?: Record<string, unknown>;
          status?: string;
        };
        Update: {
          status?: string;
          result_image_url?: string | null;
          result_post_id?: string | null;
          error_message?: string | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      upscaling_jobs: {
        Row: {
          id: string;
          user_id: string;
          source_post_id: string | null;
          source_image_url: string;
          scale_factor: 2 | 4;
          model_id: string;
          original_width: number | null;
          original_height: number | null;
          result_width: number | null;
          result_height: number | null;
          result_image_url: string | null;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          result_post_id: string | null;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_post_id?: string | null;
          source_image_url: string;
          scale_factor?: number;
          model_id?: string;
          original_width?: number | null;
          original_height?: number | null;
          status?: string;
        };
        Update: {
          status?: string;
          result_image_url?: string | null;
          result_width?: number | null;
          result_height?: number | null;
          result_post_id?: string | null;
          error_message?: string | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      controlnet_jobs: {
        Row: {
          id: string;
          user_id: string;
          source_post_id: string | null;
          control_image_url: string;
          control_type: 'canny' | 'depth' | 'pose' | 'scribble' | 'normal' | 'mlsd' | 'seg';
          prompt: string;
          negative_prompt: string | null;
          model_id: string;
          control_strength: number;
          settings: Record<string, unknown>;
          result_image_url: string | null;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          result_post_id: string | null;
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_post_id?: string | null;
          control_image_url: string;
          control_type: string;
          prompt: string;
          negative_prompt?: string | null;
          model_id?: string;
          control_strength?: number;
          settings?: Record<string, unknown>;
          status?: string;
        };
        Update: {
          status?: string;
          result_image_url?: string | null;
          result_post_id?: string | null;
          error_message?: string | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      controlnet_presets: {
        Row: {
          id: string;
          name: string;
          description: string;
          control_type: string;
          preview_url: string | null;
          default_strength: number;
          sort_order: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          control_type: string;
          preview_url?: string | null;
          default_strength?: number;
          sort_order?: number;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          description?: string;
          preview_url?: string | null;
          default_strength?: number;
          sort_order?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };

      // === BATCH 2: Art Battles ===
      art_battles: {
        Row: {
          id: string;
          title: string;
          theme: string;
          description: string | null;
          status: 'waiting' | 'active' | 'voting' | 'completed';
          creator_id: string;
          opponent_id: string | null;
          winner_id: string | null;
          time_limit_minutes: number;
          voting_ends_at: string | null;
          created_at: string;
          started_at: string | null;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          theme: string;
          description?: string | null;
          status?: string;
          creator_id: string;
          opponent_id?: string | null;
          time_limit_minutes?: number;
        };
        Update: {
          status?: string;
          opponent_id?: string | null;
          winner_id?: string | null;
          voting_ends_at?: string | null;
          started_at?: string | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      battle_entries: {
        Row: {
          id: string;
          battle_id: string;
          user_id: string;
          post_id: string | null;
          image_url: string | null;
          prompt_used: string | null;
          vote_count: number;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          battle_id: string;
          user_id: string;
          post_id?: string | null;
          image_url?: string | null;
          prompt_used?: string | null;
        };
        Update: {
          post_id?: string | null;
          image_url?: string | null;
          prompt_used?: string | null;
          vote_count?: number;
        };
        Relationships: [];
      };
      battle_votes: {
        Row: {
          id: string;
          battle_id: string;
          entry_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          battle_id: string;
          entry_id: string;
          user_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };

      // === BATCH 3: Prompt Chains/Workflows ===
      workflow_templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          steps: Record<string, unknown>[];
          is_public: boolean;
          use_count: number;
          save_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          steps: Record<string, unknown>[];
          is_public?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          steps?: Record<string, unknown>[];
          is_public?: boolean;
          use_count?: number;
          save_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      workflow_runs: {
        Row: {
          id: string;
          user_id: string;
          template_id: string | null;
          name: string;
          steps: Record<string, unknown>[];
          current_step: number;
          status: 'pending' | 'running' | 'paused' | 'completed' | 'failed';
          results: Record<string, unknown>[];
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id?: string | null;
          name: string;
          steps: Record<string, unknown>[];
          current_step?: number;
          status?: string;
        };
        Update: {
          current_step?: number;
          status?: string;
          results?: Record<string, unknown>[];
          error_message?: string | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      workflow_saves: {
        Row: {
          id: string;
          user_id: string;
          template_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };

      // === BATCH 4: Learning System ===
      tutorials: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          category: 'basics' | 'prompting' | 'styles' | 'advanced' | 'models' | 'composition';
          difficulty: 'beginner' | 'intermediate' | 'advanced';
          cover_image_url: string | null;
          estimated_minutes: number;
          xp_reward: number;
          sort_order: number;
          is_published: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          category: string;
          difficulty?: string;
          cover_image_url?: string | null;
          estimated_minutes?: number;
          xp_reward?: number;
          sort_order?: number;
          is_published?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          cover_image_url?: string | null;
          estimated_minutes?: number;
          xp_reward?: number;
          sort_order?: number;
          is_published?: boolean;
        };
        Relationships: [];
      };
      tutorial_lessons: {
        Row: {
          id: string;
          tutorial_id: string;
          title: string;
          content_type: 'text' | 'interactive' | 'quiz' | 'practice';
          content: Record<string, unknown>;
          sort_order: number;
          xp_reward: number;
        };
        Insert: {
          id?: string;
          tutorial_id: string;
          title: string;
          content_type: string;
          content: Record<string, unknown>;
          sort_order?: number;
          xp_reward?: number;
        };
        Update: {
          title?: string;
          content_type?: string;
          content?: Record<string, unknown>;
          sort_order?: number;
          xp_reward?: number;
        };
        Relationships: [];
      };
      user_tutorial_progress: {
        Row: {
          id: string;
          user_id: string;
          tutorial_id: string;
          current_lesson: number;
          completed_lessons: number[];
          is_completed: boolean;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          tutorial_id: string;
          current_lesson?: number;
          completed_lessons?: number[];
        };
        Update: {
          current_lesson?: number;
          completed_lessons?: number[];
          is_completed?: boolean;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      user_xp: {
        Row: {
          id: string;
          user_id: string;
          total_xp: number;
          level: number;
          xp_to_next_level: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_xp?: number;
          level?: number;
          xp_to_next_level?: number;
        };
        Update: {
          total_xp?: number;
          level?: number;
          xp_to_next_level?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      xp_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          source: 'tutorial' | 'lesson' | 'challenge' | 'battle' | 'daily_post' | 'streak' | 'badge';
          source_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          source: string;
          source_id?: string | null;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      mentorships: {
        Row: {
          id: string;
          mentor_id: string;
          mentee_id: string;
          status: 'pending' | 'active' | 'completed' | 'cancelled';
          focus_areas: string[];
          message: string | null;
          created_at: string;
          accepted_at: string | null;
        };
        Insert: {
          id?: string;
          mentor_id: string;
          mentee_id: string;
          status?: string;
          focus_areas?: string[];
          message?: string | null;
        };
        Update: {
          status?: string;
          accepted_at?: string | null;
        };
        Relationships: [];
      };
      mentorship_sessions: {
        Row: {
          id: string;
          mentorship_id: string;
          post_id: string | null;
          feedback: string;
          rating: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          mentorship_id: string;
          post_id?: string | null;
          feedback: string;
          rating?: number | null;
        };
        Update: {
          feedback?: string;
          rating?: number | null;
        };
        Relationships: [];
      };

      // === BATCH 5: Events & Exhibitions ===
      exhibitions: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          theme: string | null;
          cover_image_url: string | null;
          curator_id: string;
          status: 'accepting' | 'curating' | 'live' | 'archived';
          max_submissions: number;
          submission_count: number;
          view_count: number;
          starts_at: string | null;
          ends_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          theme?: string | null;
          cover_image_url?: string | null;
          curator_id: string;
          status?: string;
          max_submissions?: number;
          starts_at?: string | null;
          ends_at?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          theme?: string | null;
          cover_image_url?: string | null;
          status?: string;
          max_submissions?: number;
          submission_count?: number;
          view_count?: number;
          starts_at?: string | null;
          ends_at?: string | null;
        };
        Relationships: [];
      };
      exhibition_submissions: {
        Row: {
          id: string;
          exhibition_id: string;
          user_id: string;
          post_id: string;
          status: 'pending' | 'accepted' | 'rejected' | 'featured';
          curator_note: string | null;
          position: number | null;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          exhibition_id: string;
          user_id: string;
          post_id: string;
          status?: string;
        };
        Update: {
          status?: string;
          curator_note?: string | null;
          position?: number | null;
        };
        Relationships: [];
      };
      exhibition_visits: {
        Row: {
          id: string;
          exhibition_id: string;
          user_id: string;
          visited_at: string;
        };
        Insert: {
          id?: string;
          exhibition_id: string;
          user_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_type: 'workshop' | 'ama' | 'livestream' | 'challenge_event' | 'meetup';
          host_id: string;
          community_id: string | null;
          cover_image_url: string | null;
          status: 'upcoming' | 'live' | 'completed' | 'cancelled';
          max_attendees: number | null;
          attendee_count: number;
          starts_at: string;
          ends_at: string | null;
          meeting_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          event_type: string;
          host_id: string;
          community_id?: string | null;
          cover_image_url?: string | null;
          status?: string;
          max_attendees?: number | null;
          starts_at: string;
          ends_at?: string | null;
          meeting_url?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          cover_image_url?: string | null;
          status?: string;
          attendee_count?: number;
          meeting_url?: string | null;
        };
        Relationships: [];
      };
      event_attendees: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          rsvp_status: 'going' | 'interested' | 'not_going';
          created_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          rsvp_status?: string;
        };
        Update: {
          rsvp_status?: string;
        };
        Relationships: [];
      };
      weekly_events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          theme: string;
          hashtag: string;
          cover_image_url: string | null;
          reward_badge_id: string | null;
          starts_at: string;
          ends_at: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          theme: string;
          hashtag: string;
          cover_image_url?: string | null;
          reward_badge_id?: string | null;
          starts_at: string;
          ends_at: string;
          is_active?: boolean;
        };
        Update: {
          title?: string;
          description?: string | null;
          theme?: string;
          cover_image_url?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      weekly_event_entries: {
        Row: {
          id: string;
          event_id: string;
          user_id: string;
          post_id: string;
          vote_count: number;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          user_id: string;
          post_id: string;
        };
        Update: {
          vote_count?: number;
        };
        Relationships: [];
      };
      weekly_event_votes: {
        Row: {
          id: string;
          entry_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          entry_id: string;
          user_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };

      // === BATCH 6: Art Critique + AI Avatars ===
      post_critiques: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          composition_rating: number | null;
          color_rating: number | null;
          technique_rating: number | null;
          prompt_craft_rating: number | null;
          originality_rating: number | null;
          overall_rating: number | null;
          feedback_text: string;
          helpful_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          composition_rating?: number | null;
          color_rating?: number | null;
          technique_rating?: number | null;
          prompt_craft_rating?: number | null;
          originality_rating?: number | null;
          overall_rating?: number | null;
          feedback_text: string;
        };
        Update: {
          composition_rating?: number | null;
          color_rating?: number | null;
          technique_rating?: number | null;
          prompt_craft_rating?: number | null;
          originality_rating?: number | null;
          overall_rating?: number | null;
          feedback_text?: string;
          helpful_count?: number;
        };
        Relationships: [];
      };
      critique_helpful_votes: {
        Row: {
          id: string;
          critique_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          critique_id: string;
          user_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      avatar_generation_jobs: {
        Row: {
          id: string;
          user_id: string;
          source_image_urls: string[];
          style: 'anime' | 'cartoon' | '3d' | 'pixel' | 'watercolor' | 'oil_painting' | 'cyberpunk' | 'fantasy' | 'minimalist' | 'pop_art';
          prompt_modifier: string | null;
          result_urls: string[];
          status: 'pending' | 'processing' | 'completed' | 'failed';
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          source_image_urls: string[];
          style: string;
          prompt_modifier?: string | null;
          status?: string;
        };
        Update: {
          status?: string;
          result_urls?: string[];
          error_message?: string | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      user_avatars: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          style: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          style: string;
          is_active?: boolean;
        };
        Update: {
          is_active?: boolean;
        };
        Relationships: [];
      };

      // === BATCH 7: AI Music, Stickers, Text-to-3D ===
      music_generation_jobs: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          prompt: string | null;
          mood: 'calm' | 'energetic' | 'dramatic' | 'mysterious' | 'happy' | 'sad' | 'epic' | 'ambient' | 'playful' | 'dark' | null;
          duration_seconds: number;
          genre: string | null;
          result_audio_url: string | null;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          prompt?: string | null;
          mood?: string | null;
          duration_seconds?: number;
          genre?: string | null;
          status?: string;
        };
        Update: {
          status?: string;
          result_audio_url?: string | null;
          error_message?: string | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      sticker_packs: {
        Row: {
          id: string;
          creator_id: string;
          name: string;
          description: string | null;
          cover_url: string | null;
          is_public: boolean;
          download_count: number;
          sticker_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          creator_id: string;
          name: string;
          description?: string | null;
          cover_url?: string | null;
          is_public?: boolean;
        };
        Update: {
          name?: string;
          description?: string | null;
          cover_url?: string | null;
          is_public?: boolean;
          download_count?: number;
          sticker_count?: number;
        };
        Relationships: [];
      };
      stickers: {
        Row: {
          id: string;
          pack_id: string;
          image_url: string;
          label: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          pack_id: string;
          image_url: string;
          label?: string | null;
          sort_order?: number;
        };
        Update: {
          label?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      user_sticker_packs: {
        Row: {
          id: string;
          user_id: string;
          pack_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pack_id: string;
        };
        Update: Record<string, never>;
        Relationships: [];
      };
      text_to_3d_jobs: {
        Row: {
          id: string;
          user_id: string;
          prompt: string;
          negative_prompt: string | null;
          model_id: string;
          settings: Record<string, unknown>;
          result_model_url: string | null;
          result_thumbnail_url: string | null;
          status: 'pending' | 'processing' | 'completed' | 'failed';
          error_message: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          prompt: string;
          negative_prompt?: string | null;
          model_id?: string;
          settings?: Record<string, unknown>;
          status?: string;
        };
        Update: {
          status?: string;
          result_model_url?: string | null;
          result_thumbnail_url?: string | null;
          error_message?: string | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };

      // === BATCH 8: Portfolio, Cross-Posting, AR Preview ===
      portfolio_sections: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          sort_order?: number;
        };
        Update: {
          title?: string;
          description?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      portfolio_items: {
        Row: {
          id: string;
          section_id: string;
          post_id: string;
          caption_override: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          section_id: string;
          post_id: string;
          caption_override?: string | null;
          sort_order?: number;
        };
        Update: {
          caption_override?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      cross_post_accounts: {
        Row: {
          id: string;
          user_id: string;
          platform: 'instagram' | 'twitter' | 'tiktok' | 'facebook' | 'pinterest' | 'threads';
          platform_username: string | null;
          is_connected: boolean;
          access_token_encrypted: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          platform: string;
          platform_username?: string | null;
          is_connected?: boolean;
          access_token_encrypted?: string | null;
        };
        Update: {
          platform_username?: string | null;
          is_connected?: boolean;
          access_token_encrypted?: string | null;
        };
        Relationships: [];
      };
      cross_posts: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          platform: string;
          platform_post_id: string | null;
          status: 'pending' | 'posting' | 'posted' | 'failed';
          error_message: string | null;
          posted_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          platform: string;
          status?: string;
        };
        Update: {
          status?: string;
          platform_post_id?: string | null;
          error_message?: string | null;
          posted_at?: string | null;
        };
        Relationships: [];
      };
      ar_previews: {
        Row: {
          id: string;
          post_id: string;
          frame_style: 'none' | 'thin_black' | 'thin_white' | 'gallery' | 'modern' | 'ornate';
          default_width_cm: number;
          default_height_cm: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          frame_style?: string;
          default_width_cm?: number;
          default_height_cm?: number;
        };
        Update: {
          frame_style?: string;
          default_width_cm?: number;
          default_height_cm?: number;
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
      get_post_insights: {
        Args: {
          target_post_id: string;
        };
        Returns: Record<string, unknown>;
      };
      search_similar_posts: {
        Args: {
          query_embedding: unknown;
          match_threshold?: number;
          match_count?: number;
          exclude_post_id?: string;
        };
        Returns: {
          post_id: string;
          similarity: number;
        }[];
      };
      get_personalized_feed: {
        Args: {
          target_user_id: string;
          page_offset?: number;
          page_limit?: number;
        };
        Returns: {
          post_id: string;
          relevance_score: number;
        }[];
      };
      get_blend_feed: {
        Args: {
          blend_id: string;
          page_offset?: number;
          page_limit?: number;
        };
        Returns: {
          post_id: string;
          relevance_score: number;
        }[];
      };
      refresh_trending: {
        Args: Record<string, never>;
        Returns: undefined;
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
export type PostReaction = Database['public']['Tables']['post_reactions']['Row'];
export type Collection = Database['public']['Tables']['collections']['Row'];
export type CloseFriend = Database['public']['Tables']['close_friends']['Row'];
export type StorySticker = Database['public']['Tables']['story_stickers']['Row'];
export type StickerResponse = Database['public']['Tables']['story_sticker_responses']['Row'];
export type PostCollaborator = Database['public']['Tables']['post_collaborators']['Row'];
export type PostView = Database['public']['Tables']['post_views']['Row'];
export type Location = Database['public']['Tables']['locations']['Row'];
export type ProfileTopFriend = Database['public']['Tables']['profile_top_friends']['Row'];
export type PromptLibraryItem = Database['public']['Tables']['prompt_library']['Row'];
export type PromptLibraryInsert = Database['public']['Tables']['prompt_library']['Insert'];
export type PromptSave = Database['public']['Tables']['prompt_saves']['Row'];
export type Repost = Database['public']['Tables']['reposts']['Row'];
export type PostPoll = Database['public']['Tables']['post_polls']['Row'];
export type PollOption = Database['public']['Tables']['poll_options']['Row'];
export type PollVote = Database['public']['Tables']['poll_votes']['Row'];
export type DailyChallenge = Database['public']['Tables']['daily_challenges']['Row'];
export type ChallengeEntry = Database['public']['Tables']['challenge_entries']['Row'];
export type ChallengeVote = Database['public']['Tables']['challenge_votes']['Row'];
export type Challenge = Database['public']['Tables']['challenges']['Row'];
export type UserNote = Database['public']['Tables']['user_notes']['Row'];
export type Badge = Database['public']['Tables']['badges']['Row'];
export type UserBadge = Database['public']['Tables']['user_badges']['Row'];
export type UserStreak = Database['public']['Tables']['user_streaks']['Row'];
export type CreationStreak = Database['public']['Tables']['creation_streaks']['Row'];
export type Community = Database['public']['Tables']['communities']['Row'];
export type CommunityMember = Database['public']['Tables']['community_members']['Row'];
export type AwardType = Database['public']['Tables']['award_types']['Row'];
export type PostAward = Database['public']['Tables']['post_awards']['Row'];
export type SubscriptionTier = Database['public']['Tables']['subscription_tiers']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type Wallet = Database['public']['Tables']['wallets']['Row'];
export type WalletTransaction = Database['public']['Tables']['wallet_transactions']['Row'];
export type Tip = Database['public']['Tables']['tips']['Row'];
export type MarketplaceListing = Database['public']['Tables']['marketplace_listings']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type PostEmbedding = Database['public']['Tables']['post_embeddings']['Row'];
export type TasteProfile = Database['public']['Tables']['taste_profiles']['Row'];
export type EngagementSignal = Database['public']['Tables']['engagement_signals']['Row'];
export type BlendFeed = Database['public']['Tables']['blend_feeds']['Row'];
export type StylePreset = Database['public']['Tables']['style_presets']['Row'];
export type RestyleJob = Database['public']['Tables']['restyle_jobs']['Row'];
export type AnimationJob = Database['public']['Tables']['animation_jobs']['Row'];
export type PromptRemix = Database['public']['Tables']['prompt_remixes']['Row'];
export type ArtProvenance = Database['public']['Tables']['art_provenance']['Row'];
export type ContentLabel = Database['public']['Tables']['content_labels']['Row'];
export type ContentRating = Database['public']['Tables']['content_ratings']['Row'];
export type SafetyPreference = Database['public']['Tables']['safety_preferences']['Row'];
export type CommunityPost = Database['public']['Tables']['community_posts']['Row'];

// Batch 1: AI Creation Tools
export type InpaintingJob = Database['public']['Tables']['inpainting_jobs']['Row'];
export type OutpaintingJob = Database['public']['Tables']['outpainting_jobs']['Row'];
export type UpscalingJob = Database['public']['Tables']['upscaling_jobs']['Row'];
export type ControlNetJob = Database['public']['Tables']['controlnet_jobs']['Row'];
export type ControlNetPreset = Database['public']['Tables']['controlnet_presets']['Row'];

// Batch 2: Art Battles
export type ArtBattle = Database['public']['Tables']['art_battles']['Row'];
export type BattleEntry = Database['public']['Tables']['battle_entries']['Row'];
export type BattleVote = Database['public']['Tables']['battle_votes']['Row'];

// Batch 3: Prompt Chains/Workflows
export type WorkflowTemplate = Database['public']['Tables']['workflow_templates']['Row'];
export type WorkflowRun = Database['public']['Tables']['workflow_runs']['Row'];
export type WorkflowSave = Database['public']['Tables']['workflow_saves']['Row'];

// Batch 4: Learning System
export type Tutorial = Database['public']['Tables']['tutorials']['Row'];
export type TutorialLesson = Database['public']['Tables']['tutorial_lessons']['Row'];
export type UserTutorialProgress = Database['public']['Tables']['user_tutorial_progress']['Row'];
export type UserXp = Database['public']['Tables']['user_xp']['Row'];
export type XpTransaction = Database['public']['Tables']['xp_transactions']['Row'];
export type Mentorship = Database['public']['Tables']['mentorships']['Row'];
export type MentorshipSession = Database['public']['Tables']['mentorship_sessions']['Row'];

// Batch 5: Events & Exhibitions
export type Exhibition = Database['public']['Tables']['exhibitions']['Row'];
export type ExhibitionSubmission = Database['public']['Tables']['exhibition_submissions']['Row'];
export type ExhibitionVisit = Database['public']['Tables']['exhibition_visits']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type EventAttendee = Database['public']['Tables']['event_attendees']['Row'];
export type WeeklyEvent = Database['public']['Tables']['weekly_events']['Row'];
export type WeeklyEventEntry = Database['public']['Tables']['weekly_event_entries']['Row'];
export type WeeklyEventVote = Database['public']['Tables']['weekly_event_votes']['Row'];

// Batch 6: Art Critique + AI Avatars
export type PostCritique = Database['public']['Tables']['post_critiques']['Row'];
export type CritiqueHelpfulVote = Database['public']['Tables']['critique_helpful_votes']['Row'];
export type AvatarGenerationJob = Database['public']['Tables']['avatar_generation_jobs']['Row'];
export type UserAvatar = Database['public']['Tables']['user_avatars']['Row'];

// Batch 7: AI Music, Stickers, Text-to-3D
export type MusicGenerationJob = Database['public']['Tables']['music_generation_jobs']['Row'];
export type StickerPack = Database['public']['Tables']['sticker_packs']['Row'];
export type Sticker = Database['public']['Tables']['stickers']['Row'];
export type UserStickerPack = Database['public']['Tables']['user_sticker_packs']['Row'];
export type Text3DJob = Database['public']['Tables']['text_to_3d_jobs']['Row'];

// Batch 8: Portfolio, Cross-Posting, AR Preview
export type PortfolioSection = Database['public']['Tables']['portfolio_sections']['Row'];
export type PortfolioItem = Database['public']['Tables']['portfolio_items']['Row'];
export type CrossPostAccount = Database['public']['Tables']['cross_post_accounts']['Row'];
export type CrossPost = Database['public']['Tables']['cross_posts']['Row'];
export type ArPreview = Database['public']['Tables']['ar_previews']['Row'];

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

export type ReactionType = PostReaction['reaction_type'];

export type ReactionSummary = {
  type: ReactionType;
  count: number;
};

export type PostInsights = {
  total_views: number;
  unique_viewers: number;
  likes: number;
  comments: number;
  saves: number;
  source_breakdown: Record<string, number>;
};
