'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Check, X, FileText } from 'lucide-react'
import { updatePostStatus } from '@/app/admin/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getCategoryName } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface BoardCardProps {
  post: {
    id: string
    title: string
    status: string
    category: string
    created_at: string
    author: { nickname: string }
  }
  showActions?: boolean
}

export function BoardCard({ post, showActions = false }: BoardCardProps) {
  const router = useRouter()

  const handleApprove = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const result = await updatePostStatus(post.id, 'published')
    if (result?.error) {
      toast.error('操作失败', { description: result.error })
    } else {
      toast.success('已通过审核')
      router.refresh()
    }
  }

  const handleReject = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const result = await updatePostStatus(post.id, 'rejected')
    if (result?.error) {
      toast.error('操作失败', { description: result.error })
    } else {
      toast.success('已拒绝投稿')
      router.refresh()
    }
  }

  return (
    <Link href={`/posts/${post.id}`} target="_blank">
      <Card className="p-3 hover:shadow-md transition-shadow cursor-pointer">
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <p className="text-sm font-medium line-clamp-2 leading-snug">{post.title}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              {getCategoryName(post.category)}
            </Badge>
            <span>{post.author?.nickname || 'Unknown'}</span>
            <span>·</span>
            <span>{formatDistanceToNow(new Date(post.created_at), { locale: zhCN, addSuffix: true })}</span>
          </div>
          {showActions && (
            <div className="flex gap-2 pt-1">
              <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={handleApprove}>
                <Check className="h-3 w-3 mr-1" />
                通过
              </Button>
              <Button size="sm" variant="outline" className="h-7 text-xs flex-1" onClick={handleReject}>
                <X className="h-3 w-3 mr-1" />
                拒绝
              </Button>
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
