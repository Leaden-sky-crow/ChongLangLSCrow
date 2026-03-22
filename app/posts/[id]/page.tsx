import { notFound } from 'next/navigation'
import { getPost } from '@/lib/posts'
import { PostHeader } from '@/components/post-header'
import { PostContent } from '@/components/post-content'
import { Comments } from '@/components/comments'
import { LikeButton } from '@/components/like-button'
import { ViewTracker } from '@/components/view-tracker'
import { createClient } from '@/utils/supabase/server'
import { Metadata } from 'next'

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const post = await getPost(id)

  if (!post) {
    return {
      title: '文章未找到',
    }
  }

  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      images: post.cover_url ? [post.cover_url] : [],
    },
  }
}

export default async function PostPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  
  // Parallel data fetching - avoid waterfalls
  const [post, userResult, commentsResult] = await Promise.all([
    getPost(id),
    supabase.auth.getUser(),
    supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        user:profiles!user_id(nickname, avatar_url)
      `)
      .eq('post_id', id)
      .order('created_at', { ascending: false })
  ])

  if (!post) {
    notFound()
  }

  const { data: { user } } = userResult

  // 检查用户是否为管理员
  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }
  
  // Check if user liked the post
  let isLiked = false
  if (user) {
    const { data } = await supabase
      .from('likes')
      .select('user_id')
      .eq('post_id', id)
      .eq('user_id', user.id)
      .single()
    isLiked = !!data
  }

  // Transform comments user
  const formattedComments = commentsResult.data?.map((c: any) => ({
    ...c,
    user: Array.isArray(c.user) ? c.user[0] : c.user
  })) || []

  return (
    <article className="min-h-screen pb-20">
      <PostHeader post={post} />
      
      {/* View tracker - increments view count after 3 seconds */}
      <ViewTracker postId={post.id} />
      
      <div className="container max-w-3xl py-8">
        <PostContent content={post.content} />
        
        <div className="my-12 flex items-center justify-between border-t border-b py-6">
           <div className="flex items-center space-x-4">
              {/* Share button etc - Placeholder */}
           </div>
           <LikeButton postId={post.id} initialCount={post.likes_count} initialIsLiked={isLiked} />
        </div>

        <Comments 
          postId={post.id} 
          comments={formattedComments} 
          currentUserId={user?.id}
          isAdmin={isAdmin}
        />
      </div>
    </article>
  )
}
