'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function SearchInput() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="搜索..."
        className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </form>
  )
}
