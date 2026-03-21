import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

// Cache getPosts for this request (deduplication)
export const getPosts = cache(async (category?: string, page: number = 1, limit: number = 20) => {
  const supabase = await createClient()
  
  let query = supabase
    .from('posts')
    .select(`
      id,
      title,
      summary,
      cover_url,
      category,
      created_at,
      view_count,
      status,
      is_pinned,
      is_featured,
      author:profiles!author_id(nickname, avatar_url),
      series:series_id(*),
      likes(count),
      comments(count)
    `, { count: 'exact' })
    .eq('status', 'published')

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  // Pagination
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, count, error } = await query
    .order('is_pinned', { ascending: false })
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching posts:', error)
    return { posts: [], count: 0 }
  }

  // Transform data to flat structure
  const posts = data.map(post => ({
    ...post,
    author: Array.isArray(post.author) ? post.author[0] : post.author,
    series: Array.isArray(post.series) ? post.series[0] : post.series,
    likes_count: post.likes?.[0]?.count || 0,
    comments_count: post.comments?.[0]?.count || 0,
  }))

  return { posts, count }
})

// Cache getPost for this request
export const getPost = cache(async (id: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      summary,
      content,
      cover_url,
      category,
      created_at,
      updated_at,
      view_count,
      status,
      is_pinned,
      is_featured,
      author_id,
      series_id,
      author:profiles!author_id(nickname, avatar_url),
      likes(count),
      comments(count),
      series:series_id(*)
    `)
    .eq('id', id)
    .single()

  if (error || !data) {
    return null
  }

  return {
    ...data,
    author: Array.isArray(data.author) ? data.author[0] : data.author,
    series: Array.isArray(data.series) ? data.series[0] : data.series,
    likes_count: data.likes?.[0]?.count || 0,
    comments_count: data.comments?.[0]?.count || 0,
  }
})

// Cache searchPosts for this request
export const searchPosts = cache(async (queryStr: string) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      id,
      title,
      summary,
      cover_url,
      category,
      created_at,
      view_count,
      status,
      is_pinned,
      is_featured,
      author:profiles!author_id(nickname, avatar_url),
      likes(count),
      comments(count)
    `)
    .eq('status', 'published')
    .or(`title.ilike.%${queryStr}%,summary.ilike.%${queryStr}%`)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error searching posts:', error)
    return []
  }

  return data.map(post => ({
    ...post,
    author: Array.isArray(post.author) ? post.author[0] : post.author,
    likes_count: post.likes?.[0]?.count || 0,
    comments_count: post.comments?.[0]?.count || 0,
  }))
})

export const searchSeries = cache(async (queryStr: string) => {
  const supabase = await createClient()
  
  const { data: seriesData, error } = await supabase
    .from('series')
    .select(`
      *,
      author:profiles(
        nickname,
        avatar_url
      )
    `)
    .or(`name.ilike.%${queryStr}%,description.ilike.%${queryStr}%`)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('Error searching series:', error)
    return []
  }

  const seriesWithStats = await Promise.all(
    seriesData.map(async (series) => {
      const { data: postsData } = await supabase
        .from('posts')
        .select('id, title, created_at, likes_count, comments_count')
        .eq('series_id', series.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(3)

      const { data: statsData } = await supabase
        .from('posts')
        .select('likes_count, comments_count')
        .eq('series_id', series.id)
        .eq('status', 'published')

      const total_likes = statsData?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0
      const total_comments = statsData?.reduce((sum, post) => sum + (post.comments_count || 0), 0) || 0

      return {
        ...series,
        latest_posts: postsData?.map(post => ({ id: post.id, title: post.title })) || [],
        total_likes,
        total_comments,
      }
    })
  )

  return seriesWithStats.filter(series => 
    series.latest_posts && series.latest_posts.length > 0
  )
})
