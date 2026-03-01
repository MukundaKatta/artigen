-- Location Tags with Map
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text,
  lat double precision,
  lng double precision,
  post_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_locations_name_trgm ON locations USING gin (name gin_trgm_ops);
CREATE INDEX idx_locations_coords ON locations(lat, lng);

-- Add location_id FK to posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS location_id uuid REFERENCES locations(id) ON DELETE SET NULL;

-- Trigger: auto-update location post_count
CREATE OR REPLACE FUNCTION sync_location_count() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.location_id IS NOT NULL THEN
    UPDATE locations SET post_count = post_count + 1 WHERE id = NEW.location_id;
  ELSIF TG_OP = 'DELETE' AND OLD.location_id IS NOT NULL THEN
    UPDATE locations SET post_count = post_count - 1 WHERE id = OLD.location_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.location_id IS DISTINCT FROM NEW.location_id THEN
      IF OLD.location_id IS NOT NULL THEN
        UPDATE locations SET post_count = post_count - 1 WHERE id = OLD.location_id;
      END IF;
      IF NEW.location_id IS NOT NULL THEN
        UPDATE locations SET post_count = post_count + 1 WHERE id = NEW.location_id;
      END IF;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_location_count
AFTER INSERT OR UPDATE OR DELETE ON posts
FOR EACH ROW EXECUTE FUNCTION sync_location_count();

-- RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Anyone can insert locations" ON locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update locations" ON locations FOR UPDATE USING (true);
