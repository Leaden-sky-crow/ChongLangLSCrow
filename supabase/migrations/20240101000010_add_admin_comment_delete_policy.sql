-- 添加管理员删除评论的权限

-- 确保 comments 表的 RLS 策略允许管理员删除任何评论
drop policy if exists "Admins can delete any comment." on public.comments;

-- 创建新策略允许管理员删除任何评论
create policy "Admins can delete any comment."
  on public.comments for delete
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- 验证策略（可选）
-- select * from pg_policies where tablename = 'comments';
