'use client'

import { useEffect } from 'react'
import { incrementViewCount } from '@/app/posts/actions'

interface ViewTrackerProps {
  postId: string
}

export function ViewTracker({ postId }: ViewTrackerProps) {
  useEffect(() => {
    // 延迟 3 秒再记录，确保用户真的在阅读
    const timer = setTimeout(() => {
      incrementViewCount(postId)
        .then(result => {
          if (result?.error) {
            console.error('阅读量记录失败:', result.error)
          }
        })
        .catch(console.error)
    }, 3000) // 3 秒后记录
    
    return () => clearTimeout(timer)
  }, [postId])
  
  return null
}
