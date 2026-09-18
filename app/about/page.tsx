import { AboutSection } from '@/components/about-section'
import { promises as fs } from 'fs'
import path from 'path'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '关于我',
}

export default async function AboutPage() {
  const filePath = path.join(process.cwd(), 'about_me.md')
  let aboutContent = ''
  try {
    aboutContent = await fs.readFile(filePath, 'utf-8')
  } catch (error) {
    console.error('Error reading about_me.md:', error)
    aboutContent = '# About Me\n\nFile not found.'
  }

  return (
    <div className="container py-20 min-h-screen">
      <AboutSection content={aboutContent} />
    </div>
  )
}
