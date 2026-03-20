'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { CategoryFilter } from '@/components/category-filter'

export function PostsCategoryFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category') || 'all'

  const handleCategoryChange = (categoryId: string) => {
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('category', categoryId)
    router.push(`/posts?${newParams.toString()}`)
  }

  return (
    <CategoryFilter 
      selectedCategory={currentCategory}
      onCategoryChange={handleCategoryChange}
    />
  )
}
