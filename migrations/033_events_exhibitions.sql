-- Exhibitions
CREATE TABLE IF NOT EXISTS exhibitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  theme text,
  cover_image_url text,
  curator_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'accepting' CHECK (status IN ('accepting','curating','live','archived')),
  max_submissions integer DEFAULT 50,
  submission_count integer DEFAULT 0,
  view_count integer DEFAULT 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exhibition_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id uuid REFERENCES exhibitions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected','featured')),
  curator_note text,
  position integer,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(exhibition_id, post_id)
);

CREATE TABLE IF NOT EXISTS exhibition_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exhibition_id uuid REFERENCES exhibitions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  visited_at timestamptz DEFAULT now(),
  UNIQUE(exhibition_id, user_id)
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text NOT NULL CHECK (event_type IN ('workshop','ama','livestream','challenge_event','meetup')),
  host_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  community_id uuid REFERENCES communities(id) ON DELETE SET NULL,
  cover_image_url text,
  status text DEFAULT 'upcoming' CHECK (status IN ('upcoming','live','completed','cancelled')),
  max_attendees integer,
  attendee_count integer DEFAULT 0,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  meeting_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS event_attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  rsvp_status text DEFAULT 'going' CHECK (rsvp_status IN ('going','interested','not_going')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Weekly Themed Events
CREATE TABLE IF NOT EXISTS weekly_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  theme text NOT NULL,
  hashtag text NOT NULL,
  cover_image_url text,
  reward_badge_id text REFERENCES badges(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weekly_event_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES weekly_events(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
  vote_count integer DEFAULT 0,
  submitted_at timestamptz DEFAULT now(),
  UNIQUE(event_id, user_id)
);

CREATE TABLE IF NOT EXISTS weekly_event_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id uuid REFERENCES weekly_event_entries(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(entry_id, user_id)
);

-- Indexes
CREATE INDEX idx_exhibitions_status ON exhibitions(status);
CREATE INDEX idx_exhibition_submissions_exhibition ON exhibition_submissions(exhibition_id);
CREATE INDEX idx_events_starts ON events(starts_at);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX idx_weekly_events_active ON weekly_events(is_active) WHERE is_active;
CREATE INDEX idx_weekly_event_entries_event ON weekly_event_entries(event_id);
CREATE INDEX idx_weekly_event_votes_entry ON weekly_event_votes(entry_id);

-- RLS
ALTER TABLE exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibition_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_event_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_event_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view live exhibitions" ON exhibitions FOR SELECT USING (true);
CREATE POLICY "Curators create exhibitions" ON exhibitions FOR INSERT WITH CHECK (curator_id = auth.uid());
CREATE POLICY "Curators update own" ON exhibitions FOR UPDATE USING (curator_id = auth.uid());

CREATE POLICY "Anyone can view submissions" ON exhibition_submissions FOR SELECT USING (true);
CREATE POLICY "Users submit to exhibitions" ON exhibition_submissions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Curators manage submissions" ON exhibition_submissions FOR UPDATE USING (EXISTS(SELECT 1 FROM exhibitions WHERE id = exhibition_id AND curator_id = auth.uid()));

CREATE POLICY "Anyone can view visits" ON exhibition_visits FOR SELECT USING (true);
CREATE POLICY "Users record visits" ON exhibition_visits FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view events" ON events FOR SELECT USING (true);
CREATE POLICY "Users create events" ON events FOR INSERT WITH CHECK (host_id = auth.uid());
CREATE POLICY "Hosts update events" ON events FOR UPDATE USING (host_id = auth.uid());

CREATE POLICY "Anyone can view attendees" ON event_attendees FOR SELECT USING (true);
CREATE POLICY "Users RSVP" ON event_attendees FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update RSVP" ON event_attendees FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users remove RSVP" ON event_attendees FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Anyone can view weekly events" ON weekly_events FOR SELECT USING (true);
CREATE POLICY "Anyone can view weekly entries" ON weekly_event_entries FOR SELECT USING (true);
CREATE POLICY "Users submit entries" ON weekly_event_entries FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Anyone can view weekly votes" ON weekly_event_votes FOR SELECT USING (true);
CREATE POLICY "Users vote" ON weekly_event_votes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users unvote" ON weekly_event_votes FOR DELETE USING (user_id = auth.uid());

-- DOWN
-- Manual rollback:
-- DROP POLICY IF EXISTS "Users unvote" ON weekly_event_votes;
-- DROP POLICY IF EXISTS "Users vote" ON weekly_event_votes;
-- DROP POLICY IF EXISTS "Anyone can view weekly votes" ON weekly_event_votes;
-- DROP POLICY IF EXISTS "Users submit entries" ON weekly_event_entries;
-- DROP POLICY IF EXISTS "Anyone can view weekly entries" ON weekly_event_entries;
-- DROP POLICY IF EXISTS "Anyone can view weekly events" ON weekly_events;
-- DROP POLICY IF EXISTS "Users remove RSVP" ON event_attendees;
-- DROP POLICY IF EXISTS "Users update RSVP" ON event_attendees;
-- DROP POLICY IF EXISTS "Users RSVP" ON event_attendees;
-- DROP POLICY IF EXISTS "Anyone can view attendees" ON event_attendees;
-- DROP POLICY IF EXISTS "Hosts update events" ON events;
-- DROP POLICY IF EXISTS "Users create events" ON events;
-- DROP POLICY IF EXISTS "Anyone can view events" ON events;
-- DROP POLICY IF EXISTS "Users record visits" ON exhibition_visits;
-- DROP POLICY IF EXISTS "Anyone can view visits" ON exhibition_visits;
-- DROP POLICY IF EXISTS "Curators manage submissions" ON exhibition_submissions;
-- DROP POLICY IF EXISTS "Users submit to exhibitions" ON exhibition_submissions;
-- DROP POLICY IF EXISTS "Anyone can view submissions" ON exhibition_submissions;
-- DROP POLICY IF EXISTS "Curators update own" ON exhibitions;
-- DROP POLICY IF EXISTS "Curators create exhibitions" ON exhibitions;
-- DROP POLICY IF EXISTS "Anyone can view live exhibitions" ON exhibitions;
-- DROP INDEX IF EXISTS idx_weekly_event_votes_entry;
-- DROP INDEX IF EXISTS idx_weekly_event_entries_event;
-- DROP INDEX IF EXISTS idx_weekly_events_active;
-- DROP INDEX IF EXISTS idx_event_attendees_event;
-- DROP INDEX IF EXISTS idx_events_status;
-- DROP INDEX IF EXISTS idx_events_starts;
-- DROP INDEX IF EXISTS idx_exhibition_submissions_exhibition;
-- DROP INDEX IF EXISTS idx_exhibitions_status;
-- DROP TABLE IF EXISTS weekly_event_votes;
-- DROP TABLE IF EXISTS weekly_event_entries;
-- DROP TABLE IF EXISTS weekly_events;
-- DROP TABLE IF EXISTS event_attendees;
-- DROP TABLE IF EXISTS events;
-- DROP TABLE IF EXISTS exhibition_visits;
-- DROP TABLE IF EXISTS exhibition_submissions;
-- DROP TABLE IF EXISTS exhibitions;
