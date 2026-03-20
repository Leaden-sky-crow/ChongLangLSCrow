'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function incrementViewCount(postId: string) {
  const cookieStore = await cookies()
  const viewedPosts = cookieStore.get('viewed_posts')?.value || ''
  
  // 检查是否已经阅读过（24 小时内不重复计数）
  if (viewedPosts.includes(postId)) {
    return { skipped: true, reason: 'already_viewed' }
  }
  
  const supabase = await createClient()
  
  const { error } = await supabase.rpc('increment_view_count', {
    post_id: postId
  })
  
  if (error) {
    console.error('增加阅读量失败:', error)
    return { error: error.message }
  }
  
  // 设置 Cookie，标记为已阅读
  const newViewedPosts = viewedPosts 
    ? `${viewedPosts},${postId}` 
    : postId
  
  cookieStore.set('viewed_posts', newViewedPosts, {
    maxAge: 60 * 60 * 24, // 24 小时
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
  
  revalidatePath(`/posts/${postId}`)
  return { success: true }
}

export async function createComment(postId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '请先登录' }

  if (!content || content.trim().length === 0) {
    return { error: '评论内容不能为空' }
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      user_id: user.id,
      content,
    })
    .select()
    .single()

  if (error) {
    console.error('创建评论失败:', error)
    return { error: error.message }
  }

  revalidatePath(`/posts/${postId}`)
  return { success: true, data }
}

export async function deleteComment(commentId: string, postId: string) {
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

  revalidatePath(`/posts/${postId}`)
  return { success: true }
}

export async function likePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '请先登录' }

  const { error } = await supabase
    .from('likes')
    .insert({
      post_id: postId,
      user_id: user.id,
    })

  if (error) {
    console.error('点赞失败:', error)
    return { error: error.message }
  }

  revalidatePath(`/posts/${postId}`)
  return { success: true }
}

export async function unlikePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '请先登录' }

  const { error } = await supabase
    .from('likes')
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id)

  if (error) {
    console.error('取消点赞失败:', error)
    return { error: error.message }
  }

  revalidatePath(`/posts/${postId}`)
  return { success: true }
}
