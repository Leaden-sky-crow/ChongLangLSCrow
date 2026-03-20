import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AdminOverview } from '@/components/admin/overview'
import { PostsManagement } from '@/components/admin/posts-management'
import { UsersManagement } from '@/components/admin/users-management'
import { NotificationsManagement } from '@/components/admin/notifications-management'
import { getUsers } from '@/app/admin/users-actions'
import { Github } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cache } from 'react'

// Cache admin check for this request
const checkAdminRole = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return profile?.role === 'admin'
})

// Cache stats calculation
const calculatePostStats = cache((posts: any[]) => ({
  total: posts?.length || 0,
  pending: posts?.filter(p => p.status === 'pending').length || 0,
  published: posts?.filter(p => p.status === 'published').length || 0,
  rejected: posts?.filter(p => p.status === 'rejected').length || 0,
}))

const calculateUserStats = cache((users: any[]) => ({
  total: users.length,
  admins: users.filter(u => u.role === 'admin').length,
}))

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check admin role (cached)
  const isAdmin = await checkAdminRole(user.id)
  if (!isAdmin) {
    redirect('/')
  }

  // Parallel data fetching - avoid waterfalls
  const [postsResult, usersResult] = await Promise.all([
    supabase
      .from('posts')
      .select('*, author:profiles!author_id(nickname)')
      .order('created_at', { ascending: false }),
    getUsers()
  ])

  const posts = postsResult.data
  const users = usersResult.users || []

  // Handle errors from getUsers
  if (usersResult.error) {
    console.error('获取用户列表失败:', usersResult.error)
  }

  // Calculate stats (cached, derived during render)
  const postStats = calculatePostStats(posts || [])
  const userStats = calculateUserStats(users)

  // Transform posts - minimize data passed to client
  const transformPost = (post: any) => ({
    id: post.id,
    title: post.title,
    status: post.status,
    category: post.category,
    created_at: post.created_at,
    author: Array.isArray(post.author) ? post.author[0] : post.author,
  })

  return (
    <div className="container py-8 min-h-screen" suppressHydrationWarning>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">管理员后台</h1>
        <Link href="https://github.com/Leaden-sky-crow/ChongLangLSCrow" target="_blank">
          <Button variant="outline">
            <Github className="mr-2 h-4 w-4" />
            GitHub Repository
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard">仪表盘</TabsTrigger>
          <TabsTrigger value="posts">文章管理</TabsTrigger>
          <TabsTrigger value="users">用户管理</TabsTrigger>
          <TabsTrigger value="notifications">通知管理</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AdminOverview postStats={postStats} userStats={userStats} />
        </TabsContent>

        <TabsContent value="posts">
          <PostsManagement posts={posts?.map(transformPost) || []} />
        </TabsContent>

        <TabsContent value="users">
          <UsersManagement users={users} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
