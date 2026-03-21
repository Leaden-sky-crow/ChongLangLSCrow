-- 添加 likes_count 和 comments_count 字段到 posts 表
alter table public.posts 
add column if not exists likes_count int default 0,
add column if not exists comments_count int default 0;

-- 初始化现有数据的统计
update public.posts p
set 
  likes_count = coalesce((select count(*) from public.likes where post_id = p.id), 0),
  comments_count = coalesce((select count(*) from public.comments where post_id = p.id), 0);

-- 创建索引以提高查询性能
create index if not exists idx_likes_post_id on public.likes(post_id);
create index if not exists idx_comments_post_id on public.comments(post_id);

-- 创建函数：更新文章的点赞数
create or replace function update_post_likes_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.posts 
    set likes_count = likes_count + 1 
    where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.posts 
    set likes_count = greatest(likes_count - 1, 0) 
    where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- 创建函数：更新文章的评论数
create or replace function update_post_comments_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.posts 
    set comments_count = comments_count + 1 
    where id = new.post_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.posts 
    set comments_count = greatest(comments_count - 1, 0) 
    where id = old.post_id;
    return old;
  end if;
  return null;
end;
$$ language plpgsql security definer;

-- 创建触发器
create trigger on_like_created
  after insert on public.likes
  for each row execute procedure update_post_likes_count();

create trigger on_like_deleted
  after delete on public.likes
  for each row execute procedure update_post_likes_count();

create trigger on_comment_created
  after insert on public.comments
  for each row execute procedure update_post_comments_count();

create trigger on_comment_deleted
  after delete on public.comments
  for each row execute procedure update_post_comments_count();
