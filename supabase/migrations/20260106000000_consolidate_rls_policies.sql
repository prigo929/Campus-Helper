/*
  # Consolidate RLS policies to remove overlaps

  - Drops existing policies on key tables and recreates single, clear policies per command
  - Applies to: profiles, jobs, marketplace_items, forum_posts, forum_comments, reports, conversations, conversation_participants, messages
*/

-- Drop existing policies on targeted tables
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles','jobs','marketplace_items','forum_posts','forum_comments','reports','conversations','conversation_participants','messages')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

-- Profiles
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "profiles_insert_self"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_self_or_admin"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR (auth.jwt() ->> 'role') = 'admin')
  WITH CHECK (auth.uid() = id OR (auth.jwt() ->> 'role') = 'admin');

-- Jobs
CREATE POLICY "jobs_select_authenticated"
  ON jobs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "jobs_insert_owner"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "jobs_update_owner_or_admin"
  ON jobs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR (auth.jwt() ->> 'role') = 'admin')
  WITH CHECK (auth.uid() = user_id OR (auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "jobs_delete_owner_or_admin"
  ON jobs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR (auth.jwt() ->> 'role') = 'admin');

-- Marketplace
CREATE POLICY "marketplace_select_authenticated"
  ON marketplace_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "marketplace_insert_owner"
  ON marketplace_items FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "marketplace_update_owner_or_admin"
  ON marketplace_items FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR (auth.jwt() ->> 'role') = 'admin')
  WITH CHECK (auth.uid() = user_id OR (auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "marketplace_delete_owner_or_admin"
  ON marketplace_items FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR (auth.jwt() ->> 'role') = 'admin');

-- Forum posts
CREATE POLICY "forum_posts_select_authenticated"
  ON forum_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "forum_posts_insert_owner"
  ON forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "forum_posts_update_owner_or_admin"
  ON forum_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR (auth.jwt() ->> 'role') = 'admin')
  WITH CHECK (auth.uid() = user_id OR (auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "forum_posts_delete_owner_or_admin"
  ON forum_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR (auth.jwt() ->> 'role') = 'admin');

-- Forum comments
CREATE POLICY "forum_comments_select_authenticated"
  ON forum_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "forum_comments_insert_owner"
  ON forum_comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "forum_comments_delete_owner_or_admin"
  ON forum_comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id OR (auth.jwt() ->> 'role') = 'admin');

-- Reports
CREATE POLICY "reports_select_admin_only"
  ON reports FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

CREATE POLICY "reports_insert_authenticated"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "reports_delete_admin_only"
  ON reports FOR DELETE
  TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin');

-- Conversations
CREATE POLICY "conversations_select_member_or_starter"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    public.is_conversation_member(id)
    OR started_by = auth.uid()
  );

CREATE POLICY "conversations_insert_starter"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (started_by = auth.uid());

-- Conversation participants
CREATE POLICY "conversation_participants_select_member"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (public.is_conversation_member(conversation_id));

CREATE POLICY "conversation_participants_insert_member_or_starter"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM conversations c WHERE c.id = conversation_participants.conversation_id AND c.started_by = auth.uid()
    )
  );

-- Messages
CREATE POLICY "messages_select_member"
  ON messages FOR SELECT
  TO authenticated
  USING (public.is_conversation_member(conversation_id));

CREATE POLICY "messages_insert_member_sender"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND public.is_conversation_member(conversation_id)
  );
