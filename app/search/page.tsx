import { searchPosts, searchSeries } from '@/lib/posts'
import { PostCard, type Post } from '@/components/post-card'
import { SeriesList } from '@/components/series-list'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Book, Folder } from 'lucide-react'
import { Metadata } from 'next'
import config from '@/config.json'

export const metadata: Metadata = {
  title: `搜索 | ${config.title}`,
}

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

  const [posts, series] = await Promise.all([
    searchPosts(q),
    searchSeries(q)
  ])

  return (
    <div className="container py-8 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">"{q}" 的搜索结果</h1>
      <Tabs defaultValue="posts" className="space-y-6">
        <TabsList>
          <TabsTrigger value="posts">
            <Book className="h-4 w-4 mr-1" />
            文章 ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="series">
            <Folder className="h-4 w-4 mr-1" />
            系列 ({series.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts">
          {posts.length === 0 ? (
            <p className="text-muted-foreground">没有找到相关文章。</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post as unknown as Post} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="series">
          <SeriesList series={series} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
