'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { BookOpen, Users, AlertCircle, FileText, FilePenLine, CheckCircle2, Search, X, RotateCcw } from 'lucide-react'
import { BoardCard } from '@/components/admin/board-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Post {
  id: string
  title: string
  status: string
  category: string
  created_at: string
  author: { nickname: string }
  summary: string
  content: string
  series_id: string | null
  series_name: string | null
}

interface Series {
  id: string
  name: string
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
  allSeries: Series[]
}

export function AdminOverview({ postStats, userStats, posts, allSeries }: StatsProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedSeries, setSelectedSeries] = useState('')

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = !searchQuery ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())

      const postDate = new Date(post.created_at)
      const matchesStartDate = !startDate || postDate >= new Date(startDate)
      const matchesEndDate = !endDate || postDate <= new Date(endDate + 'T23:59:59')

      const matchesSeries = !selectedSeries || selectedSeries === '__none__'
        ? selectedSeries === '__none__' ? post.series_id === null : true
        : post.series_id === selectedSeries

      return matchesSearch && matchesStartDate && matchesEndDate && matchesSeries
    })
  }, [posts, searchQuery, startDate, endDate, selectedSeries])

  const draftPosts = filteredPosts.filter(p => p.status === 'draft')
  const pendingPosts = filteredPosts.filter(p => p.status === 'pending')
  const publishedPosts = filteredPosts.filter(p => p.status === 'published')

  const hasFilters = searchQuery || startDate || endDate || selectedSeries

  const handleReset = () => {
    setSearchQuery('')
    setStartDate('')
    setEndDate('')
    setSelectedSeries('')
  }

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

      <div className="flex flex-wrap items-end gap-3 rounded-lg border p-4">
        <div className="flex-1 min-w-[200px]">
          <label className="text-sm font-medium mb-1.5 block">搜索</label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索标题或内容..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5">
                <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
              </button>
            )}
          </div>
        </div>
        <div className="min-w-[150px]">
          <label className="text-sm font-medium mb-1.5 block">开始日期</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="min-w-[150px]">
          <label className="text-sm font-medium mb-1.5 block">截止日期</label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="min-w-[150px]">
          <label className="text-sm font-medium mb-1.5 block">系列</label>
          <Select value={selectedSeries} onValueChange={(value) => setSelectedSeries(value ?? '')}>
            <SelectTrigger>
              <SelectValue placeholder="全部系列" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">全部系列</SelectItem>
              <SelectItem value="__none__">无系列</SelectItem>
              {allSeries.map((series) => (
                <SelectItem key={series.id} value={series.id}>
                  {series.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={handleReset} className="mb-0.5">
            <RotateCcw className="h-4 w-4 mr-1" />
            重置
          </Button>
        )}
      </div>

      {hasFilters && (
        <p className="text-sm text-muted-foreground">
          筛选结果：共 {filteredPosts.length} 篇文章
          {filteredPosts.length !== posts.length && ` (共 ${posts.length} 篇)`}
        </p>
      )}

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
