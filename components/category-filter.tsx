'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BookOpen, PenTool, Feather, User, Layers, Folder } from 'lucide-react'

const categories = [
  { id: 'all', label: '全部', icon: Layers },
  { id: 'novel', label: '小说', icon: BookOpen },
  { id: 'essay', label: '散文', icon: PenTool },
  { id: 'poetry', label: '诗歌', icon: Feather },
  { id: 'series', label: '系列', icon: Folder },
  { id: 'about', label: '关于我', icon: User },
]

interface CategoryFilterProps {
  selectedCategory?: string
  onCategoryChange?: (categoryId: string) => void
}

export function CategoryFilter({ selectedCategory = 'all', onCategoryChange }: CategoryFilterProps) {
  const [internalCategory, setInternalCategory] = useState(selectedCategory)
  
  const currentCategory = onCategoryChange ? selectedCategory : internalCategory

  const handleCategoryClick = (categoryId: string) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId)
    } else {
      setInternalCategory(categoryId)
    }
  }

  return (
    <div className="flex flex-wrap justify-center gap-4 py-8">
      {categories.map((cat) => (
        <Button
          key={cat.id}
          variant={currentCategory === cat.id ? "default" : "outline"}
          onClick={() => handleCategoryClick(cat.id)}
          className="rounded-full px-6 transition-all hover:scale-105"
        >
          <cat.icon className="mr-2 h-4 w-4" />
          {cat.label}
        </Button>
      ))}
    </div>
  )
}
