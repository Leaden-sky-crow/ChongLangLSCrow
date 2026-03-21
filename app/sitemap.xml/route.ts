import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const baseUrl = 'https://chonglanglscrow.cn'
  
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/posts`,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  const categoryPages = [
    {
      url: `${baseUrl}/posts?category=novel`,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/posts?category=essay`,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/posts?category=poetry`,
      lastModified: new Date().toISOString().split('T')[0],
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('id, created_at, updated_at')
    .eq('status', 'published')

  const postPages = posts?.map((post) => ({
    url: `${baseUrl}/posts/${post.id}`,
    lastModified: new Date(post.updated_at || post.created_at).toISOString().split('T')[0],
    changeFrequency: 'weekly',
    priority: 0.7,
  })) || []

  const allPages = [...staticPages, ...categoryPages, ...postPages]

  const sitemap = `<?xml version="1.0" encoding="utf-8"?>
<!-- XML 文件需以 utf-8 编码-->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
