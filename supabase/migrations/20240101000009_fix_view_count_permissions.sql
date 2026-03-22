-- 修复阅读量统计权限问题
-- 问题：increment_view_count 函数不存在或权限不足
-- 解决：重新创建函数并授权给所有用户

-- 首先确保函数存在
create or replace function public.increment_view_count(post_id uuid)
returns void as $$
begin
  update public.posts
  set view_count = view_count + 1
  where id = post_id;
end;
$$ language plpgsql security definer;

-- 授权给匿名用户（访客）
grant execute on function public.increment_view_count to anon;

-- 授权给已登录用户
grant execute on function public.increment_view_count to authenticated;

-- 验证授权（可选，用于检查）
-- select has_function_privilege('anon', 'public.increment_view_count(uuid)', 'EXECUTE');
-- select has_function_privilege('authenticated', 'public.increment_view_count(uuid)', 'EXECUTE');
