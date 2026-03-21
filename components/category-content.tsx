'use client'

import { useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CategoryFilter } from '@/components/category-filter'
import { PostList, type Post } from '@/components/post-list'
import { AboutSection } from '@/components/about-section'

interface CategoryContentProps {
  initialCategory?: string
  aboutContent?: string
  initialPosts?: Post[]
}

export function CategoryContent({ initialCategory = 'all', aboutContent, initialPosts = [] }: CategoryContentProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Get current category from URL or fallback to initial
  const selectedCategory = searchParams.get('category') || initialCategory

  const handleCategoryChange = (categoryId: string) => {
    startTransition(() => {
      if (categoryId === 'series') {
        router.push('/series')
      } else {
        const newParams = new URLSearchParams(searchParams.toString())
        newParams.set('category', categoryId)
        router.push(`?${newParams.toString()}`, { scroll: false })
      }
    })
  }

  // Filter posts on client side based on selected category
  const filteredPosts = selectedCategory === 'about' 
    ? [] 
    : selectedCategory === 'all' || selectedCategory === undefined
      ? initialPosts
      : initialPosts.filter(post => post.category === selectedCategory)

  return (
    <div className="space-y-4">
      <CategoryFilter 
        selectedCategory={selectedCategory} 
        onCategoryChange={handleCategoryChange}
      />
      <div className="mt-8">
        {isPending ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : selectedCategory === 'about' ? (
          <AboutSection content={aboutContent || ''} />
        ) : (
          <PostList posts={filteredPosts} />
        )}
      </div>
    </div>
  )
}
