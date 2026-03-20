'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { MoreHorizontal, Check, X, Trash2, Eye, EyeOff } from 'lucide-react'
import { updatePostStatus, deletePost, batchUpdatePostStatus } from '@/app/admin/actions'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface Post {
  id: string
  title: string
  status: string
  author: { nickname: string }
  created_at: string
  category: string
}

export function PostsManagement({ posts }: { posts: Post[] }) {
  const [selectedPosts, setSelectedPosts] = useState<string[]>([])
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const router = useRouter()

  // Filter logic
  const filteredPosts = posts.filter(post => {
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.author.nickname.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesCategory && matchesSearch
  })

  // Batch operations
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPosts(filteredPosts.map(p => p.id))
    } else {
      setSelectedPosts([])
    }
  }

  const handleSelectPost = (postId: string, checked: boolean) => {
    if (checked) {
      setSelectedPosts([...selectedPosts, postId])
    } else {
      setSelectedPosts(selectedPosts.filter(id => id !== postId))
    }
  }

  const handleBatchAction = async (action: 'published' | 'rejected' | 'hidden') => {
    if (!confirm(`确定要批量${action === 'published' ? '通过' : action === 'rejected' ? '拒绝' : '隐藏'}选中的 ${selectedPosts.length} 篇文章吗？`)) return
    
    const result = await batchUpdatePostStatus(selectedPosts, action)
    if (result.success) {
      toast.success('批量操作成功')
      setSelectedPosts([])
      router.refresh()
    } else {
      toast.error('操作失败')
    }
  }

  // Single operations
  const handleStatusUpdate = async (postId: string, status: string) => {
    if (status === 'rejected') {
      setSelectedPostId(postId)
      setRejectDialogOpen(true)
      return
    }

    const result = await updatePostStatus(postId, status)
    if (result?.error) {
      toast.error('操作失败', { description: result.error })
    } else {
      toast.success('状态已更新')
      router.refresh()
    }
  }

  const handleRejectConfirm = async () => {
    if (!selectedPostId || !rejectReason) return

    const result = await updatePostStatus(selectedPostId, 'rejected', rejectReason)
    if (result?.error) {
      toast.error('操作失败', { description: result.error })
    } else {
      toast.success('已拒绝投稿')
      setRejectDialogOpen(false)
      setRejectReason('')
      setSelectedPostId(null)
      router.refresh()
    }
  }

  const handleDelete = async (postId: string) => {
    if (!confirm('确定要永久删除这篇文章吗？此操作不可撤销。')) return

    const result = await deletePost(postId)
    if (result?.error) {
      toast.error('删除失败', { description: result.error })
    } else {
      toast.success('文章已删除')
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-2 items-center">
          <Input 
            placeholder="搜索标题或作者..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-[200px] lg:w-[300px]"
          />
          <Select value={filterStatus} onValueChange={(value) => value && setFilterStatus(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              <SelectItem value="pending">待审核</SelectItem>
              <SelectItem value="published">已发布</SelectItem>
              <SelectItem value="rejected">已拒绝</SelectItem>
              <SelectItem value="hidden">已隐藏</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterCategory} onValueChange={(value) => value && setFilterCategory(value)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部分类</SelectItem>
              <SelectItem value="novel">小说</SelectItem>
              <SelectItem value="essay">散文</SelectItem>
              <SelectItem value="poetry">诗歌</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {selectedPosts.length > 0 && (
          <div className="flex gap-2">
            <Button size="sm" onClick={() => handleBatchAction('published')}>批量通过</Button>
            <Button size="sm" variant="secondary" onClick={() => handleBatchAction('hidden')}>批量隐藏</Button>
            <Button size="sm" variant="destructive" onClick={() => handleBatchAction('rejected')}>批量拒绝</Button>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={filteredPosts.length > 0 && selectedPosts.length === filteredPosts.length}
                  onCheckedChange={(checked) => handleSelectAll(!!checked)}
                />
              </TableHead>
              <TableHead>标题</TableHead>
              <TableHead>作者</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>发布时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPosts.map((post) => (
              <TableRow key={post.id}>
                <TableCell>
                  <Checkbox 
                    checked={selectedPosts.includes(post.id)}
                    onCheckedChange={(checked) => handleSelectPost(post.id, !!checked)}
                  />
                </TableCell>
                <TableCell className="font-medium max-w-[200px] truncate" title={post.title}>
                  {post.title}
                </TableCell>
                <TableCell>{post.author?.nickname || 'Unknown'}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {post.category === 'novel' ? '小说' :
                     post.category === 'essay' ? '散文' :
                     post.category === 'poetry' ? '诗歌' :
                     post.category || '未分类'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    post.status === 'published' ? 'default' :
                    post.status === 'rejected' ? 'destructive' :
                    post.status === 'pending' ? 'secondary' : 'outline'
                  }>
                    {post.status === 'published' ? '已发布' :
                     post.status === 'rejected' ? '已拒绝' :
                     post.status === 'hidden' ? '已隐藏' :
                     post.status === 'pending' ? '待审核' : '草稿'}
                  </Badge>
                </TableCell>
                <TableCell>{new Date(post.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "h-8 w-8 p-0" })}>
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Link href={`/posts/${post.id}`} target="_blank" className="flex items-center w-full">
                            <Eye className="mr-2 h-4 w-4" />
                            <span>查看详情</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {post.status === 'pending' && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(post.id, 'published')}>
                              <Check className="mr-2 h-4 w-4" />
                              通过审核
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusUpdate(post.id, 'rejected')}>
                              <X className="mr-2 h-4 w-4" />
                              拒绝投稿
                            </DropdownMenuItem>
                          </>
                        )}
                        {post.status === 'published' && (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(post.id, 'hidden')}>
                            <EyeOff className="mr-2 h-4 w-4" />
                            隐藏文章
                          </DropdownMenuItem>
                        )}
                        {post.status === 'hidden' && (
                          <DropdownMenuItem onClick={() => handleStatusUpdate(post.id, 'published')}>
                            <Eye className="mr-2 h-4 w-4" />
                            恢复显示
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleDelete(post.id)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          删除文章
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>拒绝投稿</DialogTitle>
            <DialogDescription>
              请输入拒绝原因，作者将在个人中心看到此消息。
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="例如：内容不符合社区规范..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>确认拒绝</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
