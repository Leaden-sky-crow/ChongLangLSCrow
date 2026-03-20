-- 增加阅读量的函数
create or replace function public.increment_view_count(post_id uuid)
returns void as $$
begin
  update public.posts
  set view_count = view_count + 1
  where id = post_id;
end;
$$ language plpgsql security definer;

-- 允许认证用户调用此函数
grant execute on function public.increment_view_count to authenticated;
