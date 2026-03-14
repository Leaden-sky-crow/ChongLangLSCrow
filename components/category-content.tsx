'use client'

import { useState } from 'react'
import { CategoryFilter } from '@/components/category-filter'
import { PostList, type Post } from '@/components/post-list'
import { AboutSection } from '@/components/about-section'

interface CategoryContentProps {
  initialCategory?: string
  aboutContent?: string
  initialPosts?: Post[]
}

export function CategoryContent({ initialCategory = 'all', aboutContent, initialPosts = [] }: CategoryContentProps) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [posts, setPosts] = useState<Post[]>(initialPosts)

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId)
    // Note: For now, we don't fetch new posts on category change
    // This would require a server action or API call to implement
  }

  return (
    <div className="space-y-4">
      <CategoryFilter 
        selectedCategory={selectedCategory} 
        onCategoryChange={handleCategoryChange}
      />
      <div className="mt-8">
        {selectedCategory === 'about' ? (
          <AboutSection content={aboutContent || ''} />
        ) : (
          <PostList posts={posts} />
        )}
      </div>
    </div>
  )
}
