-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create profiles table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  nickname text unique,
  avatar_url text,
  bio text,
  role text default 'user' check (role in ('user', 'admin')),
  contact_info jsonb default '{}'::jsonb,
  is_banned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on public.profiles for update
  using ( auth.uid() = id );

-- Create Series table
create table public.series (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- Enable RLS on series
alter table public.series enable row level security;

-- Series policies
create policy "Series are viewable by everyone."
  on public.series for select
  using ( true );

create policy "Users can create their own series."
  on public.series for insert
  with check ( auth.uid() = author_id );

create policy "Users can update their own series."
  on public.series for update
  using ( auth.uid() = author_id );

create policy "Users can delete their own series."
  on public.series for delete
  using ( auth.uid() = author_id );

-- Create Posts table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  content text not null,
  summary text,
  cover_url text,
  category text not null, -- 'novel', 'essay', 'poetry'
  series_id uuid references public.series(id) on delete set null,
  status text default 'pending' check (status in ('draft', 'pending', 'published', 'rejected', 'hidden')),
  reject_reason text,
  is_featured boolean default false,
  is_pinned boolean default false,
  view_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS on posts
alter table public.posts enable row level security;

-- Posts policies
-- 1. Published posts are viewable by everyone
create policy "Published posts are viewable by everyone."
  on public.posts for select
  using ( status = 'published' );

-- 2. Authors can view their own posts (regardless of status)
create policy "Authors can view own posts."
  on public.posts for select
  using ( auth.uid() = author_id );

-- 3. Admins can view all posts
create policy "Admins can view all posts."
  on public.posts for select
  using ( 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 4. Authors can create posts
create policy "Authors can create posts."
  on public.posts for insert
  with check ( auth.uid() = author_id );

-- 5. Authors can update their own posts
create policy "Authors can update own posts."
  on public.posts for update
  using ( auth.uid() = author_id );

-- 6. Admins can update any post
create policy "Admins can update any post."
  on public.posts for update
  using ( 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 7. Authors can delete their own posts
create policy "Authors can delete own posts."
  on public.posts for delete
  using ( auth.uid() = author_id );

-- 8. Admins can delete any post
create policy "Admins can delete any post."
  on public.posts for delete
  using ( 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Create Comments table
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

-- Enable RLS on comments
alter table public.comments enable row level security;

-- Comments policies
create policy "Comments are viewable by everyone."
  on public.comments for select
  using ( true );

create policy "Authenticated users can create comments."
  on public.comments for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own comments."
  on public.comments for delete
  using ( auth.uid() = user_id );

create policy "Admins can delete any comment."
  on public.comments for delete
  using ( 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create policy "Post authors can delete comments on their posts."
  on public.comments for delete
  using ( 
    exists (
      select 1 from public.posts
      where id = comments.post_id and author_id = auth.uid()
    )
  );

-- Create Likes table
create table public.likes (
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, post_id)
);

-- Enable RLS on likes
alter table public.likes enable row level security;

-- Likes policies
create policy "Likes are viewable by everyone."
  on public.likes for select
  using ( true );

create policy "Authenticated users can create likes."
  on public.likes for insert
  with check ( auth.uid() = user_id );

create policy "Users can delete their own likes."
  on public.likes for delete
  using ( auth.uid() = user_id );

-- Create Notifications table
create table public.notifications (
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

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nickname, avatar_url)
  values (new.id, new.raw_user_meta_data->>'nickname', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Trigger for posts updated_at
create trigger update_posts_updated_at
    before update on public.posts
    for each row execute procedure update_updated_at_column();

-- Trigger for profiles updated_at
create trigger update_profiles_updated_at
    before update on public.profiles
    for each row execute procedure update_updated_at_column();
