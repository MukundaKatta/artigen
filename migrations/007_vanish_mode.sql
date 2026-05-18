-- Vanish Mode (Disappearing Messages)
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS is_vanish_mode boolean DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_ephemeral boolean DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS seen_by uuid[] DEFAULT '{}';

-- Cleanup function for ephemeral messages (seen by all participants)
CREATE OR REPLACE FUNCTION cleanup_ephemeral_messages() RETURNS trigger AS $$
DECLARE
  participant_count integer;
  seen_count integer;
BEGIN
  SELECT count(*) INTO participant_count FROM conversation_participants WHERE conversation_id = NEW.conversation_id;
  seen_count := array_length(NEW.seen_by, 1);
  IF seen_count IS NOT NULL AND seen_count >= participant_count THEN
    DELETE FROM messages WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cleanup_ephemeral
AFTER UPDATE OF seen_by ON messages
FOR EACH ROW
WHEN (NEW.is_ephemeral = true)
EXECUTE FUNCTION cleanup_ephemeral_messages();

-- DOWN
-- Manual rollback:
-- DROP TRIGGER IF EXISTS trg_cleanup_ephemeral ON messages;
-- DROP FUNCTION IF EXISTS cleanup_ephemeral_messages();
-- ALTER TABLE messages DROP COLUMN IF EXISTS seen_by;
-- ALTER TABLE messages DROP COLUMN IF EXISTS is_ephemeral;
-- ALTER TABLE conversations DROP COLUMN IF EXISTS is_vanish_mode;
