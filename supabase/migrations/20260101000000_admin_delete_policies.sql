/*
  # Admin delete policies for moderation

  Allows users with JWT claim role = 'admin' to delete any jobs, marketplace_items, forum_posts, and forum_comments.
*/

-- Jobs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jobs' AND policyname = 'Admin delete jobs'
  ) THEN
    CREATE POLICY "Admin delete jobs" ON jobs FOR DELETE TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');
  END IF;
END $$;

-- Marketplace items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'marketplace_items' AND policyname = 'Admin delete items'
  ) THEN
    CREATE POLICY "Admin delete items" ON marketplace_items FOR DELETE TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');
  END IF;
END $$;

-- Forum posts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'forum_posts' AND policyname = 'Admin delete posts'
  ) THEN
    CREATE POLICY "Admin delete posts" ON forum_posts FOR DELETE TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');
  END IF;
END $$;

-- Forum comments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'forum_comments' AND policyname = 'Admin delete comments'
  ) THEN
    CREATE POLICY "Admin delete comments" ON forum_comments FOR DELETE TO authenticated USING ((auth.jwt() ->> 'role') = 'admin');
  END IF;
END $$;
