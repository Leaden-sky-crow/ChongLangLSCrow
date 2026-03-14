import { searchPosts } from '@/lib/posts'
import { PostCard, type Post } from '@/components/post-card'

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  
  if (!q) {
    return (
      <div className="container py-8 min-h-screen">
        <h1 className="text-3xl font-bold mb-8">搜索</h1>
        <p className="text-muted-foreground">请输入关键词进行搜索。</p>
      </div>
    )
  }

  const posts = await searchPosts(q)

  return (
    <div className="container py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">"{q}" 的搜索结果</h1>
      {posts.length === 0 ? (
        <p className="text-muted-foreground">没有找到相关文章。</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post as unknown as Post} />
          ))}
        </div>
      )}
    </div>
  )
}
