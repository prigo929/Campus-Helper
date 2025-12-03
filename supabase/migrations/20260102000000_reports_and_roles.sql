/*
  # Reports table and admin role support

  - Add role and banned columns to profiles
  - Create reports table to capture user reports
  - RLS so authenticated users can file reports; admins (role=admin in JWT) can manage
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS banned boolean DEFAULT false;

CREATE TABLE IF NOT EXISTS reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL,
  target_table text NOT NULL,
  target_id uuid,
  target_user_id uuid,
  reporter_user_id uuid NOT NULL,
  reason text NOT NULL,
  details text,
  status text NOT NULL DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Reporters can create their own reports
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reporter_user_id);

-- Admins can manage all reports
CREATE POLICY "Admins manage reports" ON reports
  FOR ALL TO authenticated
  USING ((auth.jwt() ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() ->> 'role') = 'admin');
