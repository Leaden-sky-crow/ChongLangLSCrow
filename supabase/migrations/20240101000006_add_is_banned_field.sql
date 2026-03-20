-- 修复用户管理和系列删除功能
-- 运行此脚本以添加缺失的 is_banned 字段并修复 RLS 策略

-- 1. 添加 is_banned 字段到 profiles 表
alter table public.profiles 
add column if not exists is_banned boolean default false;

-- 2. 添加索引提高查询性能
create index if not exists idx_profiles_is_banned on public.profiles(is_banned);

-- 3. 确保系列删除策略存在
drop policy if exists "Users can delete their own series." on public.series;
create policy "Users can delete their own series."
  on public.series for delete
  using ( auth.uid() = author_id );

-- 4. 验证字段已添加
-- select column_name, data_type, column_default 
-- from information_schema.columns 
-- where table_name = 'profiles' and column_name = 'is_banned';
