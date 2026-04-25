'use client'

import { useState } from 'react'
import { createComment, deleteComment } from '@/app/posts/actions'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  user: {
    nickname: string
    avatar_url: string
  }
}

interface CommentsProps {
  postId: string
  comments: Comment[]
  currentUserId?: string
  isAdmin?: boolean
}

export function Comments({ postId, comments, currentUserId, isAdmin = false }: CommentsProps) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setLoading(true)
    const result = await createComment(postId, content)
    
    if (result && 'error' in result && result.error) {
      toast.error('评论失败', { description: result.error })
    } else {
      toast.success('评论已发布')
      setContent('')
      router.refresh()
    }
    setLoading(false)
  }

  const handleDelete = async (commentId: string) => {
    if (!confirm('确定要删除这条评论吗？')) return
    
    const result = await deleteComment(commentId, postId)
    if (result && 'error' in result && result.error) {
      toast.error('删除失败', { description: result.error })
    } else {
      toast.success('评论已删除')
      router.refresh()
    }
  }

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold">评论 ({comments.length})</h3>
      
      {currentUserId ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            placeholder="写下你的评论..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={loading || !content.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              发布评论
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-lg bg-muted p-4 text-center">
          请 <Button variant="link" className="px-1" onClick={() => router.push('/login')}>登录</Button> 后发表评论
        </div>
      )}

      <div className="space-y-6">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-4">
            <Link href={`/user/${comment.user_id}`} className="flex-shrink-0 cursor-pointer">
              <Avatar>
                <AvatarImage src={comment.user?.avatar_url} />
                <AvatarFallback>{comment.user?.nickname?.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Link href={`/user/${comment.user_id}`} className="font-semibold hover:underline cursor-pointer">
                    {comment.user?.nickname || 'Unknown'}
                  </Link>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(comment.created_at), 'PPP p', { locale: zhCN })}
                  </span>
                </div>
                {currentUserId && (currentUserId === comment.user_id || isAdmin) && (
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(comment.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </Button>
                )}
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
