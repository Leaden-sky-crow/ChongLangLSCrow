-- 添加管理员更新 profiles 表的 RLS 策略
-- 运行此脚本以确保管理员可以更新用户资料（提权/封禁）

-- 确保 Admin 可以更新任何用户资料
drop policy if exists "Admins can update any profile." on public.profiles;
create policy "Admins can update any profile."
  on public.profiles for update
  using ( 
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 验证策略已添加
-- select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- from pg_policies
-- where tablename = 'profiles' and policyname = 'Admins can update any profile.';
