import { HeroSection } from '@/components/hero-section'
import { CategoryContent } from '@/components/category-content'
import { getPosts } from '@/lib/posts'
import config from '@/config.json'
import { promises as fs } from 'fs'
import path from 'path'
import { Metadata } from 'next'
import { cache } from 'react'

// Cache the about_me.md read operation for this request
const getAboutContent = cache(async () => {
  const filePath = path.join(process.cwd(), 'about_me.md')
  try {
    return await fs.readFile(filePath, 'utf-8')
  } catch (error) {
    console.error('Error reading about_me.md:', error)
    return '# About Me\n\nFile not found.'
  }
})

export const metadata: Metadata = {
  title: '主页',
}

export default async function Home({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams

  // Parallel data fetching - avoid waterfalls
  const [aboutContent, postsResult] = await Promise.all([
    getAboutContent(),
    category !== 'about' ? getPosts(category || 'all') : Promise.resolve({ posts: [] })
  ])

  const initialPosts = postsResult.posts as any[]

  return (
    <main className="min-h-screen flex flex-col">
      <HeroSection title={config.title} quotes={config.quotes} />
      
      <div className="container py-8 relative z-10 bg-background/50 backdrop-blur-sm rounded-t-3xl min-h-[500px]" id="content">
        <CategoryContent 
          initialCategory={category} 
          aboutContent={aboutContent}
          initialPosts={initialPosts}
        />
      </div>
    </main>
  )
}
