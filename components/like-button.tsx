'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { likePost, unlikePost } from '@/app/posts/actions'
import { toast } from 'sonner'

interface LikeButtonProps {
  postId: string
  initialCount: number
  initialIsLiked: boolean
}

export function LikeButton({ postId, initialCount, initialIsLiked }: LikeButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)

  const handleLike = async () => {
    // Optimistic UI
    const newIsLiked = !isLiked
    const newCount = newIsLiked ? count + 1 : count - 1
    setIsLiked(newIsLiked)
    setCount(newCount)

    const action = isLiked ? unlikePost : likePost
    const result = await action(postId)

    if (result && 'error' in result && result.error) {
      // Revert if error
      setIsLiked(!newIsLiked)
      setCount(newIsLiked ? newCount - 1 : newCount + 1)
      toast.error('操作失败', { description: result.error })
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleLike} className="flex items-center gap-2">
      <Heart className={`h-5 w-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
      <span>{count}</span>
    </Button>
  )
}
