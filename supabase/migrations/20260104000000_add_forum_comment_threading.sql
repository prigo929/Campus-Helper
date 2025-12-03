/*
  # Threaded forum comments

  - Adds parent_id to forum_comments so replies can target specific comments
  - Indexes parent_id for faster threaded lookups
*/

ALTER TABLE forum_comments
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES forum_comments(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_forum_comments_parent_id ON forum_comments(parent_id);
