/*
  # Optimize auth function usage in RLS policies

  Wrap auth.* calls in SELECT to avoid per-row re-evaluation warnings.
*/

DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles','jobs','marketplace_items','forum_posts','forum_comments','reports','conversations','conversation_participants','messages','ratings')
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
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "profiles_update_self_or_admin"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = id OR ((select auth.jwt()) ->> 'role') = 'admin')
  WITH CHECK ((select auth.uid()) = id OR ((select auth.jwt()) ->> 'role') = 'admin');

-- Jobs
CREATE POLICY "jobs_select_authenticated"
  ON jobs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "jobs_insert_owner"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "jobs_update_owner_or_admin"
  ON jobs FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id OR ((select auth.jwt()) ->> 'role') = 'admin')
  WITH CHECK ((select auth.uid()) = user_id OR ((select auth.jwt()) ->> 'role') = 'admin');

CREATE POLICY "jobs_delete_owner_or_admin"
  ON jobs FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id OR ((select auth.jwt()) ->> 'role') = 'admin');

-- Marketplace
CREATE POLICY "marketplace_select_authenticated"
  ON marketplace_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "marketplace_insert_owner"
  ON marketplace_items FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "marketplace_update_owner_or_admin"
  ON marketplace_items FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id OR ((select auth.jwt()) ->> 'role') = 'admin')
  WITH CHECK ((select auth.uid()) = user_id OR ((select auth.jwt()) ->> 'role') = 'admin');

CREATE POLICY "marketplace_delete_owner_or_admin"
  ON marketplace_items FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id OR ((select auth.jwt()) ->> 'role') = 'admin');

-- Forum posts
CREATE POLICY "forum_posts_select_authenticated"
  ON forum_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "forum_posts_insert_owner"
  ON forum_posts FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "forum_posts_update_owner_or_admin"
  ON forum_posts FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = user_id OR ((select auth.jwt()) ->> 'role') = 'admin')
  WITH CHECK ((select auth.uid()) = user_id OR ((select auth.jwt()) ->> 'role') = 'admin');

CREATE POLICY "forum_posts_delete_owner_or_admin"
  ON forum_posts FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id OR ((select auth.jwt()) ->> 'role') = 'admin');

-- Forum comments
CREATE POLICY "forum_comments_select_authenticated"
  ON forum_comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "forum_comments_insert_owner"
  ON forum_comments FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "forum_comments_delete_owner_or_admin"
  ON forum_comments FOR DELETE
  TO authenticated
  USING ((select auth.uid()) = user_id OR ((select auth.jwt()) ->> 'role') = 'admin');

-- Reports
CREATE POLICY "reports_select_admin_only"
  ON reports FOR SELECT
  TO authenticated
  USING (((select auth.jwt()) ->> 'role') = 'admin');

CREATE POLICY "reports_insert_authenticated"
  ON reports FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "reports_delete_admin_only"
  ON reports FOR DELETE
  TO authenticated
  USING (((select auth.jwt()) ->> 'role') = 'admin');

-- Ratings
CREATE POLICY "ratings_select_authenticated"
  ON ratings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "ratings_insert_rater"
  ON ratings FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = rater_user_id AND rater_user_id != rated_user_id);

-- Conversations
CREATE POLICY "conversations_select_member_or_starter"
  ON conversations FOR SELECT
  TO authenticated
  USING (
    public.is_conversation_member(id)
    OR started_by = (select auth.uid())
  );

CREATE POLICY "conversations_insert_starter"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (started_by = (select auth.uid()));

-- Conversation participants
CREATE POLICY "conversation_participants_select_member"
  ON conversation_participants FOR SELECT
  TO authenticated
  USING (public.is_conversation_member(conversation_id));

CREATE POLICY "conversation_participants_insert_member_or_starter"
  ON conversation_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = (select auth.uid())
    OR EXISTS (
      SELECT 1 FROM conversations c WHERE c.id = conversation_participants.conversation_id AND c.started_by = (select auth.uid())
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
    sender_id = (select auth.uid())
    AND public.is_conversation_member(conversation_id)
  );
