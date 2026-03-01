-- Voice Messages
-- Extend message_type to include 'voice'
-- Note: In Supabase, if message_type is a text column with CHECK constraint,
-- we need to alter it. If it's just text, we add the new value.
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_message_type_check;
ALTER TABLE messages ADD CONSTRAINT messages_message_type_check
  CHECK (message_type IN ('text', 'image', 'video', 'post_share', 'story_reply', 'voice'));
