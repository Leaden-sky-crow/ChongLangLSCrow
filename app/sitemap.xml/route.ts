import { Metadata, Route } from 'next'

export default function sitemap(): Metadata {
  return {
    alternates: {
      canonical: 'https://chonglanglscrow.cn',
    },
  }
}

export const dynamic = 'force-static'

export async function GET() {
  const baseUrl = 'https://chonglanglscrow.cn'
  const staticRoutes = [
    '',
    '/posts',
    '/login',
    '/register',
    '/about',
  ]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticRoutes
    .map((route) => {
      return `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>
      `
    })
    .join('')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
