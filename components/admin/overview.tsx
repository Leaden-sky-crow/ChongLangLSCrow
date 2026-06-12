'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, AlertCircle, FileText, FilePenLine, CheckCircle2 } from 'lucide-react'
import { BoardCard } from '@/components/admin/board-card'

interface Post {
  id: string
  title: string
  status: string
  category: string
  created_at: string
  author: { nickname: string }
}

interface StatsProps {
  postStats: {
    total: number
    draft: number
    pending: number
    published: number
    rejected: number
  }
  userStats: {
    total: number
    admins: number
  }
  posts: Post[]
}

export function AdminOverview({ postStats, userStats, posts }: StatsProps) {
  const draftPosts = posts.filter(p => p.status === 'draft')
  const pendingPosts = posts.filter(p => p.status === 'pending')
  const publishedPosts = posts.filter(p => p.status === 'published')

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总文章数</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {postStats.published} 已发布, {postStats.pending} 待审核
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {userStats.admins} 管理员
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">草稿</CardTitle>
            <FilePenLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{postStats.draft}</div>
            <p className="text-xs text-muted-foreground">尚未提交审核</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">待审核</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{postStats.pending}</div>
            <p className="text-xs text-muted-foreground">需要尽快处理</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已拒绝</CardTitle>
            <FileText className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{postStats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FilePenLine className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">草稿</h3>
            <span className="text-sm text-muted-foreground">({draftPosts.length})</span>
          </div>
          <div className="space-y-2 bg-muted/50 rounded-lg p-3 min-h-[200px]">
            {draftPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">暂无草稿</p>
            ) : (
              draftPosts.slice(0, 10).map((post) => (
                <BoardCard key={post.id} post={post} />
              ))
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            <h3 className="font-semibold">未审核</h3>
            <span className="text-sm text-muted-foreground">({pendingPosts.length})</span>
          </div>
          <div className="space-y-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg p-3 min-h-[200px]">
            {pendingPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">暂无待审核文章</p>
            ) : (
              pendingPosts.slice(0, 10).map((post) => (
                <BoardCard key={post.id} post={post} showActions />
              ))
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <h3 className="font-semibold">已发布</h3>
            <span className="text-sm text-muted-foreground">({publishedPosts.length})</span>
          </div>
          <div className="space-y-2 bg-green-50 dark:bg-green-950/20 rounded-lg p-3 min-h-[200px]">
            {publishedPosts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">暂无已发布文章</p>
            ) : (
              publishedPosts.slice(0, 10).map((post) => (
                <BoardCard key={post.id} post={post} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
