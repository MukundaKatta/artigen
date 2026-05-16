-- Tutorials
CREATE TABLE IF NOT EXISTS tutorials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL CHECK (category IN ('basics','prompting','styles','advanced','models','composition')),
  difficulty text DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced')),
  cover_image_url text,
  estimated_minutes integer DEFAULT 10,
  xp_reward integer DEFAULT 50,
  sort_order integer DEFAULT 0,
  is_published boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tutorial_lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutorial_id uuid REFERENCES tutorials(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('text','interactive','quiz','practice')),
  content jsonb NOT NULL DEFAULT '{}',
  sort_order integer DEFAULT 0,
  xp_reward integer DEFAULT 10
);

CREATE TABLE IF NOT EXISTS user_tutorial_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  tutorial_id uuid REFERENCES tutorials(id) ON DELETE CASCADE NOT NULL,
  current_lesson integer DEFAULT 0,
  completed_lessons integer[] DEFAULT '{}',
  is_completed boolean DEFAULT false,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, tutorial_id)
);

-- XP System
CREATE TABLE IF NOT EXISTS user_xp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_xp integer DEFAULT 0,
  level integer DEFAULT 1,
  xp_to_next_level integer DEFAULT 100,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS xp_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  amount integer NOT NULL,
  source text NOT NULL CHECK (source IN ('tutorial','lesson','challenge','battle','daily_post','streak','badge')),
  source_id text,
  created_at timestamptz DEFAULT now()
);

-- Mentorship
CREATE TABLE IF NOT EXISTS mentorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  mentee_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending','active','completed','cancelled')),
  focus_areas text[] DEFAULT '{}',
  message text,
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  UNIQUE(mentor_id, mentee_id)
);

CREATE TABLE IF NOT EXISTS mentorship_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentorship_id uuid REFERENCES mentorships(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE SET NULL,
  feedback text NOT NULL,
  rating integer CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz DEFAULT now()
);

-- Seed tutorials
INSERT INTO tutorials (title, description, category, difficulty, xp_reward, sort_order) VALUES
  ('Getting Started with AI Art', 'Learn the basics of AI image generation', 'basics', 'beginner', 50, 1),
  ('Mastering Prompts', 'Write better prompts for stunning results', 'prompting', 'beginner', 75, 2),
  ('Art Styles Deep Dive', 'Explore different art styles and how to achieve them', 'styles', 'intermediate', 100, 3),
  ('Negative Prompts Guide', 'Use negative prompts to refine your art', 'prompting', 'intermediate', 75, 4),
  ('Advanced Composition', 'Master composition and layout in AI art', 'composition', 'advanced', 150, 5),
  ('Model Comparison Guide', 'Understand differences between AI models', 'models', 'intermediate', 100, 6),
  ('Color Theory for AI Art', 'Apply color theory to your prompts', 'styles', 'intermediate', 100, 7),
  ('Photorealistic Generation', 'Create photorealistic AI images', 'advanced', 'advanced', 200, 8),
  ('Style Mixing Techniques', 'Combine multiple art styles creatively', 'styles', 'advanced', 150, 9),
  ('ControlNet Mastery', 'Guide AI with control images', 'advanced', 'advanced', 200, 10);

-- Indexes
CREATE INDEX idx_tutorials_category ON tutorials(category);
CREATE INDEX idx_tutorial_lessons_tutorial ON tutorial_lessons(tutorial_id);
CREATE INDEX idx_user_tutorial_progress_user ON user_tutorial_progress(user_id);
CREATE INDEX idx_user_xp_user ON user_xp(user_id);
CREATE INDEX idx_xp_transactions_user ON xp_transactions(user_id);
CREATE INDEX idx_mentorships_mentor ON mentorships(mentor_id);
CREATE INDEX idx_mentorships_mentee ON mentorships(mentee_id);
CREATE INDEX idx_mentorship_sessions_mentorship ON mentorship_sessions(mentorship_id);

-- RLS
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorial_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tutorial_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentorship_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tutorials" ON tutorials FOR SELECT USING (is_published);
CREATE POLICY "Anyone can view lessons" ON tutorial_lessons FOR SELECT USING (true);
CREATE POLICY "Users view own progress" ON user_tutorial_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users track progress" ON user_tutorial_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update progress" ON user_tutorial_progress FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users view own xp" ON user_xp FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System manages xp" ON user_xp FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "System updates xp" ON user_xp FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users view own xp transactions" ON xp_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System inserts xp" ON xp_transactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Participants view mentorships" ON mentorships FOR SELECT USING (mentor_id = auth.uid() OR mentee_id = auth.uid());
CREATE POLICY "Users request mentorship" ON mentorships FOR INSERT WITH CHECK (mentee_id = auth.uid());
CREATE POLICY "Participants update mentorship" ON mentorships FOR UPDATE USING (mentor_id = auth.uid() OR mentee_id = auth.uid());
CREATE POLICY "Participants view sessions" ON mentorship_sessions FOR SELECT USING (EXISTS(SELECT 1 FROM mentorships WHERE id = mentorship_id AND (mentor_id = auth.uid() OR mentee_id = auth.uid())));
CREATE POLICY "Mentors create sessions" ON mentorship_sessions FOR INSERT WITH CHECK (EXISTS(SELECT 1 FROM mentorships WHERE id = mentorship_id AND mentor_id = auth.uid()));

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS "Mentors create sessions" ON mentorship_sessions;
-- DROP POLICY IF EXISTS "Participants view sessions" ON mentorship_sessions;
-- DROP POLICY IF EXISTS "Participants update mentorship" ON mentorships;
-- DROP POLICY IF EXISTS "Users request mentorship" ON mentorships;
-- DROP POLICY IF EXISTS "Participants view mentorships" ON mentorships;
-- DROP POLICY IF EXISTS "System inserts xp" ON xp_transactions;
-- DROP POLICY IF EXISTS "Users view own xp transactions" ON xp_transactions;
-- DROP POLICY IF EXISTS "System updates xp" ON user_xp;
-- DROP POLICY IF EXISTS "System manages xp" ON user_xp;
-- DROP POLICY IF EXISTS "Users view own xp" ON user_xp;
-- DROP POLICY IF EXISTS "Users update progress" ON user_tutorial_progress;
-- DROP POLICY IF EXISTS "Users track progress" ON user_tutorial_progress;
-- DROP POLICY IF EXISTS "Users view own progress" ON user_tutorial_progress;
-- DROP POLICY IF EXISTS "Anyone can view lessons" ON tutorial_lessons;
-- DROP POLICY IF EXISTS "Anyone can view tutorials" ON tutorials;
-- DROP INDEX IF EXISTS idx_mentorship_sessions_mentorship;
-- DROP INDEX IF EXISTS idx_mentorships_mentee;
-- DROP INDEX IF EXISTS idx_mentorships_mentor;
-- DROP INDEX IF EXISTS idx_xp_transactions_user;
-- DROP INDEX IF EXISTS idx_user_xp_user;
-- DROP INDEX IF EXISTS idx_user_tutorial_progress_user;
-- DROP INDEX IF EXISTS idx_tutorial_lessons_tutorial;
-- DROP INDEX IF EXISTS idx_tutorials_category;
-- DROP TABLE IF EXISTS mentorship_sessions;
-- DROP TABLE IF EXISTS mentorships;
-- DROP TABLE IF EXISTS xp_transactions;
-- DROP TABLE IF EXISTS user_xp;
-- DROP TABLE IF EXISTS user_tutorial_progress;
-- DROP TABLE IF EXISTS tutorial_lessons;
-- DROP TABLE IF EXISTS tutorials;
