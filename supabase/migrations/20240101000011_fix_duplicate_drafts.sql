-- 清理已存在的重复草稿并添加唯一约束
-- 创建时间: 2026-04-25

-- 1. 清理已存在的重复草稿（每个用户每个标题只保留最新的一条）
-- 删除较旧的重复草稿
DELETE FROM public.posts p1
WHERE p1.status = 'draft'
  AND EXISTS (
    SELECT 1 FROM public.posts p2
    WHERE p2.author_id = p1.author_id
      AND p2.title = p1.title
      AND p2.status = 'draft'
      AND p2.created_at > p1.created_at
  );

-- 2. 添加部分唯一索引，防止同一用户对同一标题创建多个草稿
CREATE UNIQUE INDEX idx_unique_draft_title_per_user 
ON public.posts (author_id, title) 
WHERE status = 'draft';

-- 3. 添加注释说明索引用途
COMMENT ON INDEX idx_unique_draft_title_per_user IS '确保每个用户对每个标题只能有一个草稿';
