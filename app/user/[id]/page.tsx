import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostCard } from '@/components/post-card'
import { SeriesList } from '@/components/series-list'
import { Metadata } from 'next'
import config from '@/config.json'

interface UserPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: UserPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', id)
    .single()
  
  return {
    title: `${profile?.nickname || '用户'} 的主页 - ${config.title}`,
  }
}

export default async function UserPage({ params }: UserPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // 获取用户 profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single()
  
  if (!profile) {
    notFound()
  }
  
  // 获取已发布的文章
  const { data: publishedPosts } = await supabase
    .from('posts')
    .select('*, author:profiles!author_id(*), likes(count), comments(count)')
    .eq('author_id', id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
  
  // 获取用户的所有系列
  const { data: userSeries } = await supabase
    .from('series')
    .select(`
      *,
      author:profiles(
        nickname,
        avatar_url
      )
    `)
    .eq('author_id', id)
    .order('created_at', { ascending: false })
  
  // 过滤有已发布文章的系列
  const seriesWithPosts = await Promise.all(
    (userSeries || []).map(async (series) => {
      const { data: postsData } = await supabase
        .from('posts')
        .select('id, title, created_at, likes_count, comments_count')
        .eq('series_id', series.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3)
      
      const { data: statsData } = await supabase
        .from('posts')
        .select('likes_count, comments_count')
        .eq('series_id', series.id)
        .eq('status', 'published')
      
      const total_likes = statsData?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0
      const total_comments = statsData?.reduce((sum, post) => sum + (post.comments_count || 0), 0) || 0
      
      return {
        ...series,
        latest_posts: postsData?.map(post => ({ id: post.id, title: post.title })) || [],
        total_likes,
        total_comments,
        post_count: postsData?.length || 0
      }
    })
  )
  
  const validSeries = seriesWithPosts.filter(s => s.post_count > 0)
  
  // 转换文章数据
  const transformedPosts = publishedPosts?.map((post: any) => ({
    ...post,
    likes_count: post.likes?.[0]?.count || 0,
    comments_count: post.comments?.[0]?.count || 0,
    author: Array.isArray(post.author) ? post.author[0] : post.author,
  })) || []
  
  return (
    <div className="container py-20 min-h-screen">
      {/* 用户简介卡片 */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>{profile?.nickname?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-2xl">{profile?.nickname}</CardTitle>
              <Badge variant={profile?.role === 'admin' ? 'destructive' : 'secondary'}>
                {profile?.role === 'admin' ? '管理员' : '用户'}
              </Badge>
            </div>
            <CardDescription>{profile?.bio || '这个人很懒，什么都没有写。'}</CardDescription>
            {profile?.contact_info?.email && (
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>📧 {profile.contact_info.email}</span>
              </div>
            )}
          </div>
        </CardHeader>
      </Card>
      
      {/* 投稿和系列标签 */}
      <Tabs defaultValue="posts">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="posts">
            Ta 的投稿 ({transformedPosts.length})
          </TabsTrigger>
          <TabsTrigger value="series">
            Ta 的系列 ({validSeries.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="mt-6">
          {transformedPosts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              暂无已发布的文章
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {transformedPosts.map((post: any) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="series" className="mt-6">
          <SeriesList series={validSeries} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
