import { PostList, type Post } from '@/components/post-list'
import { CategoryFilter } from '@/components/category-filter'
import { getPosts } from '@/lib/posts'

export default async function PostsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams
  const result = await getPosts(category || 'all')
  const posts = result.posts as Post[]
  
  return (
    <div className="container py-20 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">文章列表</h1>
      <CategoryFilter />
      <div className="mt-8">
        <PostList posts={posts} />
      </div>
    </div>
  )
}
