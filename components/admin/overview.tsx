'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, Users, AlertCircle, FileText } from 'lucide-react'

interface StatsProps {
  postStats: {
    total: number
    pending: number
    published: number
    rejected: number
  }
  userStats: {
    total: number
    admins: number
  }
}

export function AdminOverview({ postStats, userStats }: StatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
  )
}
