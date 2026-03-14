'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, MessageSquare, ExternalLink } from 'lucide-react'
import { deleteComment } from '@/app/profile/actions'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface Comment {
  id: string
  content: string
  created_at: string
  post: {
    id: string
    title: string
    status: string
  }
}

interface CommentsListProps {
  userId: string
  comments: Comment[]
}

export function CommentsList({ userId, comments }: CommentsListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [commentsList, setCommentsList] = useState(comments)

  const handleDeleteClick = (commentId: string) => {
    setCommentToDelete(commentId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!commentToDelete) return

    setIsDeleting(true)
    const result = await deleteComment(commentToDelete)

    if (result.success) {
      toast.success('评论已删除')
      setCommentsList(commentsList.filter(c => c.id !== commentToDelete))
    } else if (result.error) {
      toast.error(result.error)
    }

    setIsDeleting(false)
    setDeleteDialogOpen(false)
    setCommentToDelete(null)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getPostStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">已发布</Badge>
      case 'pending':
        return <Badge variant="secondary">审核中</Badge>
      case 'draft':
        return <Badge variant="outline">草稿</Badge>
      case 'rejected':
        return <Badge variant="destructive">已拒绝</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (commentsList.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-12">
        <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg">暂无评论</p>
        <p className="text-sm mt-2">您的评论将在这里显示</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      {commentsList.map((comment) => (
        <Card key={comment.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">评论于</span>
                  <a
                    href={`/posts/${comment.post.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    {comment.post.title}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  {getPostStatusBadge(comment.post.status)}
                  <span className="text-xs text-muted-foreground">
                    {formatDate(comment.created_at)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                onClick={() => handleDeleteClick(comment.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm whitespace-pre-wrap">
              {comment.content}
            </CardDescription>
          </CardContent>
        </Card>
      ))}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              此操作无法撤销。您确定要删除这条评论吗？
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? '删除中...' : '删除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
