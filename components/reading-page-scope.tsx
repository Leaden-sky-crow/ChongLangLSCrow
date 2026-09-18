'use client'

import { useEffect } from 'react'

// 在文章详情页挂载时给 body 加 reading-page 类，将全屏阅读背景限定在详情页
export function ReadingPageScope() {
  useEffect(() => {
    document.body.classList.add('reading-page')
    return () => document.body.classList.remove('reading-page')
  }, [])
  return null
}
