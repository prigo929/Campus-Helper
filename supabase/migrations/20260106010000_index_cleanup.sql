/*
  # Index cleanup and missing FK index

  - Add index for forum_comments.user_id FK
  - Drop unused indexes reported by Supabase
*/

CREATE INDEX IF NOT EXISTS idx_forum_comments_user_id ON forum_comments(user_id);

DROP INDEX IF EXISTS idx_forum_comments_parent_id;
DROP INDEX IF EXISTS idx_marketplace_status;
DROP INDEX IF EXISTS idx_jobs_status;
DROP INDEX IF EXISTS idx_jobs_category;
DROP INDEX IF EXISTS idx_marketplace_category;
DROP INDEX IF EXISTS idx_forum_posts_category;
DROP INDEX IF EXISTS idx_conversations_started_by;
DROP INDEX IF EXISTS idx_conversations_job_id;
DROP INDEX IF EXISTS idx_conversations_marketplace_item_id;
DROP INDEX IF EXISTS idx_messages_sender_id;
