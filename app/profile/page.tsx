import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { PostList } from '@/components/post-list'
import { EditProfileDialog } from '@/components/edit-profile-dialog'
import { CreateSeriesDialog } from '@/components/create-series-dialog'
import { EditSeriesDialog } from '@/components/edit-series-dialog'
import { DeletePostDialog } from '@/components/delete-post-dialog'
import { DeleteSeriesDialog } from '@/components/delete-series-dialog'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2 } from 'lucide-react'
import { deleteSeries } from '@/app/series/actions'
import { CommentsList } from '@/components/comments-list'
import { getCommentsByUser } from '@/app/profile/actions'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '个人主页',
}

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: myPosts } = await supabase
    .from('posts')
    .select('*, author:profiles!author_id(*), likes(count), comments(count)')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  const { data: likedPosts } = await supabase
    .from('likes')
    .select('post:posts(*, author:profiles!author_id(*), likes(count), comments(count))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: mySeries } = await supabase
    .from('series')
    .select('*')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  // Get series list for edit dialog
  const seriesList = mySeries?.map(s => ({ id: s.id, name: s.name })) || []

  // Transform liked posts
  const transformedLikedPosts = likedPosts?.map((item: any) => ({
    ...item.post,
    likes_count: item.post.likes?.[0]?.count || 0,
    comments_count: item.post.comments?.[0]?.count || 0,
    author: Array.isArray(item.post.author) ? item.post.author[0] : item.post.author,
  })) || []

  // Transform my posts
  const transformedMyPosts = myPosts?.map((post: any) => ({
    ...post,
    likes_count: post.likes?.[0]?.count || 0,
    comments_count: post.comments?.[0]?.count || 0,
    author: Array.isArray(post.author) ? post.author[0] : post.author,
  })) || []

  // Get user comments
  const { comments: userComments, error: commentsError } = await getCommentsByUser(user.id)

  return (
    <div className="container py-8 min-h-screen">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback>{profile?.nickname?.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{profile?.nickname}</CardTitle>
                <Badge variant={profile?.role === 'admin' ? 'destructive' : 'secondary'}>
                  {profile?.role === 'admin' ? '管理员' : '用户'}
                </Badge>
              </div>
              <EditProfileDialog profile={profile} />
            </div>
            <CardDescription>{profile?.bio || '这个人很懒，什么都没有写。'}</CardDescription>
            <div className="flex gap-4 text-sm text-muted-foreground">
              {profile?.contact_info?.email && <span>📧 {profile.contact_info.email}</span>}
              {/* Add more contact info */}
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="posts">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="posts">我的投稿 ({transformedMyPosts.length})</TabsTrigger>
          <TabsTrigger value="series">我的系列 ({mySeries?.length || 0})</TabsTrigger>
          <TabsTrigger value="likes">我的点赞 ({transformedLikedPosts.length})</TabsTrigger>
          <TabsTrigger value="comments">我的评论</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">
           {/* Custom Post List for My Posts (showing status) */}
           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
             {transformedMyPosts.map((post: any) => (
               <div key={post.id} className="relative group">
                 <div className="absolute top-2 left-2 z-10">
                   <Badge variant={
                     post.status === 'published' ? 'default' :
                     post.status === 'rejected' ? 'destructive' : 'secondary'
                   }>
                     {post.status === 'published' ? '已发布' :
                      post.status === 'rejected' ? '已拒绝' :
                      post.status === 'draft' ? '草稿' : '审核中'}
                   </Badge>
                 </div>
                 <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Link href={`/posts/${post.id}/edit`}>
                     <Button
                       variant="outline"
                       size="sm"
                       className="opacity-0 group-hover:opacity-100 transition-opacity"
                     >
                       <Edit2 className="mr-2 h-4 w-4" />
                       编辑
                     </Button>
                   </Link>
                   <DeletePostDialog postId={post.id} postTitle={post.title} />
                 </div>
                 <Link href={`/posts/${post.id}`} className="block">
                   <div className="border rounded-lg p-4 pt-12 h-full flex flex-col justify-between">
                     <div>
                       <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                       <p className="text-sm text-muted-foreground line-clamp-3">{post.summary}</p>
                     </div>
                     <div className="mt-4 text-xs text-muted-foreground">
                       {new Date(post.created_at).toLocaleDateString()}
                       {post.status === 'rejected' && (
                         <p className="text-red-500 mt-2">拒绝原因：{post.reject_reason}</p>
                       )}
                     </div>
                   </div>
                 </Link>
               </div>
             ))}
           </div>
        </TabsContent>
        <TabsContent value="series" className="mt-6">
          <div className="mb-4 flex justify-end">
            <CreateSeriesDialog />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mySeries?.map((series: any) => (
              <Card key={series.id} className="relative group">
                <CardHeader>
                  <CardTitle>{series.name}</CardTitle>
                  <CardDescription>{series.description}</CardDescription>
                </CardHeader>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <EditSeriesDialog 
                    seriesId={series.id} 
                    seriesName={series.name}
                    seriesDescription={series.description}
                  />
                  <DeleteSeriesDialog seriesId={series.id} seriesName={series.name} />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="likes" className="mt-6">
           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
             {transformedLikedPosts.map((post: any) => (
                <Link key={post.id} href={`/posts/${post.id}`} className="block">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-bold mb-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.summary}</p>
                  </div>
                </Link>
             ))}
           </div>
        </TabsContent>
        <TabsContent value="comments" className="mt-6">
          <CommentsList userId={user.id} comments={userComments || []} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
