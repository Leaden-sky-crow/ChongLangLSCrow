'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(
  userId: string,
  data: {
    nickname: string
    avatar_url?: string
    bio: string
    contact_info?: any
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || user.id !== userId) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('更新个人资料失败:', error)
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function getCommentsByUser(userId: string) {
  const supabase = await createClient()

  const { data: comments, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      created_at,
      post:posts!inner (
        id,
        title,
        status
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('获取用户评论失败:', error)
    return { comments: null, error }
  }

  // Transform comments to ensure post is a single object, not an array
  const transformedComments = comments?.map((comment: any) => ({
    ...comment,
    post: Array.isArray(comment.post) ? comment.post[0] : comment.post,
  }))

  return { comments: transformedComments, error: null }
}

export async function getPostById(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized', data: null }

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', postId)
    .eq('author_id', user.id)
    .single()

  if (error) {
    console.error('获取文章失败:', error)
    return { error: error.message, data: null }
  }

  return { data: post, error: null }
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { data: existingComment } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (!existingComment) {
    return { error: '评论不存在' }
  }

  if (existingComment.user_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) {
    console.error('删除评论失败:', error)
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}

export async function updatePost(
  postId: string,
  data: {
    title: string
    category: string
    cover_url?: string
    series_id?: string
    summary?: string
    content: string
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { title, category, cover_url, series_id, summary, content } = data

  // Validate input
  if (!title || title.trim().length === 0) {
    return { error: '标题不能为空' }
  }
  if (title.length > 100) {
    return { error: '标题不能超过 100 个字符' }
  }
  if (!content || content.trim().length === 0) {
    return { error: '内容不能为空' }
  }
  // 摘要为可选字段，只验证长度不超过限制
  if (summary && summary.length > 500) {
    return { error: '摘要不能超过 500 个字符' }
  }

  // Verify ownership
  const { data: existingPost } = await supabase
    .from('posts')
    .select('author_id, status')
    .eq('id', postId)
    .single()

  if (!existingPost) {
    return { error: '文章不存在' }
  }

  if (existingPost.author_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  // Update post - keep original created_at, update updated_at
  const updateData: any = {
    ...data,
    updated_at: new Date().toISOString(),
  }

  // If status is draft or rejected, set to pending when updating
  if (existingPost.status === 'draft' || existingPost.status === 'rejected') {
    updateData.status = 'pending'
  }

  const { data: updatedPost, error } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', postId)
    .eq('author_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('更新文章失败:', error)
    return { error: error.message }
  }

  revalidatePath('/profile')
  revalidatePath(`/posts/${postId}`)
  return { success: true, data: updatedPost }
}

export async function deletePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Verify ownership
  const { data: existingPost } = await supabase
    .from('posts')
    .select('author_id, title')
    .eq('id', postId)
    .single()

  if (!existingPost) {
    return { error: '文章不存在' }
  }

  if (existingPost.author_id !== user.id) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', user.id)

  if (error) {
    console.error('删除文章失败:', error)
    return { error: error.message }
  }

  revalidatePath('/profile')
  revalidatePath('/posts')
  return { success: true, title: existingPost.title }
}
