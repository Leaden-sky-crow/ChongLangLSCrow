-- 修复系列表和相关策略
-- 运行此脚本以确保 series 表和 RLS 策略正确配置

-- Create Series table (if not exists)
create table if not exists public.series (
  id uuid default uuid_generate_v4() primary key,
  author_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- Enable RLS on series
alter table public.series enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Series are viewable by everyone." on public.series;
drop policy if exists "Users can create their own series." on public.series;
drop policy if exists "Users can update their own series." on public.series;
drop policy if exists "Users can delete their own series." on public.series;

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

-- 添加索引以提高查询性能
create index if not exists idx_series_author_id on public.series(author_id);
create index if not exists idx_series_created_at on public.series(created_at desc);
