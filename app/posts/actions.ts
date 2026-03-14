'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function likePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase.from('likes').insert({
    user_id: user.id,
    post_id: postId,
  })

  if (error) return { error: error.message }
  revalidatePath(`/posts/${postId}`)
  return { success: true }
}

export async function unlikePost(postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('likes').delete().match({
    user_id: user.id,
    post_id: postId,
  })

  if (error) return { error: error.message }
  revalidatePath(`/posts/${postId}`)
  return { success: true }
}

export async function createComment(postId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('comments').insert({
    user_id: user.id,
    post_id: postId,
    content,
  })

  if (error) return { error: error.message }
  revalidatePath(`/posts/${postId}`)
  return { success: true }
}

export async function deleteComment(commentId: string, postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // RLS handles permission check (author or admin)
  const { error } = await supabase.from('comments').delete().eq('id', commentId)

  if (error) return { error: error.message }
  revalidatePath(`/posts/${postId}`)
  return { success: true }
}
