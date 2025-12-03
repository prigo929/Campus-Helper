-- Create notifications table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('message', 'job', 'comment')),
  title text not null,
  body text not null,
  read boolean not null default false,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;

-- Allow users to see their own notifications
create policy "Notifications are selectable by owner" on public.notifications
  for select using (auth.uid() = user_id);

-- Allow users to mark their notifications as read
create policy "Notifications can be updated by owner" on public.notifications
  for update using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Allow inserting notifications for yourself (for client-side creation or seeds)
create policy "Notifications can be inserted by owner" on public.notifications
  for insert with check (auth.uid() = user_id);

-- Helpful indexes
create index if not exists notifications_user_read_idx on public.notifications (user_id, read);
create index if not exists notifications_created_idx on public.notifications (created_at desc);
