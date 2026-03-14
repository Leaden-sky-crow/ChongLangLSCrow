'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const nickname = formData.get('nickname') as string
  const bio = formData.get('bio') as string
  const avatar_url = formData.get('avatar_url') as string
  const contact_info = formData.get('contact_info') as string

  // Check nickname uniqueness if changed
  if (nickname) {
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('nickname', nickname)
      .neq('id', user.id)
      .single()

    if (existingUser) {
      return { error: '该昵称已被使用' }
    }
  }

  let parsedContactInfo = {}
  try {
    parsedContactInfo = JSON.parse(contact_info || '{}')
  } catch {
    return { error: 'Invalid contact info format' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      nickname,
      bio,
      avatar_url,
      contact_info: parsedContactInfo,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
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
    return { error: error.message }
  }

  // Transform comments to match the expected type
  const transformedComments = (comments || []).map((comment: any) => ({
    id: comment.id,
    content: comment.content,
    created_at: comment.created_at,
    post: Array.isArray(comment.post) ? comment.post[0] : comment.post,
  }))

  return { comments: transformedComments }
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Verify ownership
  const { data: comment } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (!comment) {
    return { error: '评论不存在' }
  }

  if (comment.user_id !== user.id) {
    return { error: '无权删除此评论' }
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}
