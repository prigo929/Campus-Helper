/*
  # Add covering indexes for foreign keys flagged by Supabase
*/

CREATE INDEX IF NOT EXISTS idx_conversations_job_id_fk ON conversations(job_id);
CREATE INDEX IF NOT EXISTS idx_conversations_marketplace_item_id_fk ON conversations(marketplace_item_id);
CREATE INDEX IF NOT EXISTS idx_conversations_started_by_fk ON conversations(started_by);
CREATE INDEX IF NOT EXISTS idx_forum_comments_parent_id_fk ON forum_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id_fk ON messages(sender_id);
