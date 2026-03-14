-- Create notifications table if not exists
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  is_read boolean default false,
  type text check (type in ('system', 'post_status', 'comment', 'like')),
  link_url text,
  created_at timestamptz default now()
);

-- Enable RLS on notifications
alter table public.notifications enable row level security;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications." ON public.notifications;
DROP POLICY IF EXISTS "Admins can insert notifications." ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications." ON public.notifications;
DROP POLICY IF EXISTS "Admins can delete notifications." ON public.notifications;

-- Notifications policies
create policy "Users can view their own notifications."
  on public.notifications for select
  using ( auth.uid() = user_id );

create policy "Admins can insert notifications."
  on public.notifications for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Users can update their own notifications."
  on public.notifications for update
  using ( auth.uid() = user_id );

create policy "Admins can delete notifications."
  on public.notifications for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS notifications_user_created_idx ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS notifications_is_read_idx ON public.notifications(user_id, is_read);
