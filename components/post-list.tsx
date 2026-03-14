'use client'

import { PostCard, type Post } from './post-card'

export interface PostListProps {
  posts: Post[]
}

export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <h3 className="text-xl font-bold">暂无内容</h3>
        <p className="text-muted-foreground">该分类下还没有发布任何文章。</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

export type { Post }
