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
} from '@/components/ui/dropdown-menu'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Check, X, Trash2, Eye } from 'lucide-react'
import { updatePostStatus, deletePost } from '@/app/admin/actions'
import { toast } from 'sonner'
import Link from 'next/link'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'

interface Post {
  id: string
  title: string
  status: string
  author: { nickname: string }
  created_at: string
  category: string
}

export function PostsTable({ posts }: { posts: Post[] }) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const router = useRouter()

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
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>标题</TableHead>
            <TableHead>作者</TableHead>
            <TableHead>分类</TableHead>
            <TableHead>状态</TableHead>
            <TableHead>发布时间</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium max-w-[200px] truncate" title={post.title}>
                {post.title}
              </TableCell>
              <TableCell>{post.author?.nickname || 'Unknown'}</TableCell>
              <TableCell>
                <Badge variant="outline">{post.category}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={
                  post.status === 'published' ? 'default' :
                  post.status === 'rejected' ? 'destructive' :
                  post.status === 'pending' ? 'secondary' : 'outline'
                }>
                  {post.status === 'published' ? '已发布' :
                   post.status === 'rejected' ? '已拒绝' :
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
                        <DropdownMenuSeparator />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => handleDelete(post.id)} className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      删除文章
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
    </>
  )
}
