'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSeries(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  // Validate input
  if (!name || name.trim().length === 0) {
    return { error: '系列名称不能为空' }
  }
  if (name.length > 50) {
    return { error: '系列名称不能超过 50 个字符' }
  }
  if (description && description.length > 200) {
    return { error: '系列简介不能超过 200 个字符' }
  }

  const { data, error } = await supabase.from('series').insert({
    author_id: user.id,
    name,
    description,
  }).select()

  if (error) {
    console.error('创建系列失败:', error)
    return { error: error.message }
  }
  
  revalidatePath('/profile')
  return { success: true, data }
}

export async function deleteSeries(seriesId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('series').delete().eq('id', seriesId).eq('author_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
}

export async function updateSeries(
  seriesId: string,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  // Validate input
  if (!name || name.trim().length === 0) {
    return { error: '系列名称不能为空' }
  }
  if (name.length > 50) {
    return { error: '系列名称不能超过 50 个字符' }
  }
  if (description && description.length > 200) {
    return { error: '系列简介不能超过 200 个字符' }
  }

  const { data, error } = await supabase
    .from('series')
    .update({
      name,
      description,
      updated_at: new Date().toISOString(),
    })
    .eq('id', seriesId)
    .eq('author_id', user.id)
    .select()

  if (error) {
    console.error('更新系列失败:', error)
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true, data }
}

export async function getAllSeries() {
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
    .order('created_at', { ascending: false })

  if (error) {
    console.error('获取系列列表失败:', error)
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
}

export async function getSeriesById(seriesId: string) {
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
    .eq('id', seriesId)
    .single()

  if (error || !seriesData) {
    console.error('获取系列详情失败:', error)
    return null
  }

  const { data: postsData } = await supabase
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
      author_id,
      series_id,
      author:profiles!author_id(nickname, avatar_url),
      series:series_id(*),
      likes_count,
      comments_count
    `)
    .eq('series_id', seriesId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const total_likes = postsData?.reduce((sum, post) => sum + (post.likes_count || 0), 0) || 0
  const total_comments = postsData?.reduce((sum, post) => sum + (post.comments_count || 0), 0) || 0

  return {
    ...seriesData,
    posts: postsData?.map(post => ({
      ...post,
      author: Array.isArray(post.author) ? post.author[0] : post.author,
      series: Array.isArray(post.series) ? post.series[0] : post.series,
    })) || [],
    total_likes,
    total_comments,
  }
}
