'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createPost(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const summary = formData.get('summary') as string
  const category = formData.get('category') as string
  const status = formData.get('status') as string
  const series_id = formData.get('series_id') as string
  const draftId = formData.get('draftId') as string

  const postData: any = {
    title,
    content,
    summary,
    category,
    status,
    updated_at: new Date().toISOString(),
  }

  if (series_id && series_id !== 'none') {
    postData.series_id = series_id
  }

  // 如果是草稿，检查是否存在同名草稿以进行覆盖
  if (status === 'draft') {
    // 如果提供了 draftId，直接更新
    if (draftId) {
      const { data: updatedPost, error: updateError } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', draftId)
        .eq('author_id', user.id)
        .eq('status', 'draft')
        .select()
        .single()

      if (updateError) {
        return { error: updateError.message }
      }

      revalidatePath('/profile')
      return { success: true, id: updatedPost.id, updated: true }
    }

    // 查询是否存在同作者、同标题的草稿
    const { data: existingDraft } = await supabase
      .from('posts')
      .select('id')
      .eq('author_id', user.id)
      .eq('title', title)
      .eq('status', 'draft')
      .single()

    // 如果存在同名草稿，更新它
    if (existingDraft) {
      const { data: updatedPost, error: updateError } = await supabase
        .from('posts')
        .update(postData)
        .eq('id', existingDraft.id)
        .eq('author_id', user.id)
        .eq('status', 'draft')
        .select()
        .single()

      if (updateError) {
        return { error: updateError.message }
      }

      revalidatePath('/profile')
      return { success: true, id: updatedPost.id, updated: true }
    }
  }

  // 如果不是草稿或不存在同名草稿，插入新记录
  postData.author_id = user.id
  postData.created_at = new Date().toISOString()

  const { data: newPost, error } = await supabase
    .from('posts')
    .insert(postData)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/profile')
  return { success: true, id: newPost.id, updated: false }
}

export async function getMySeries() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data } = await supabase
    .from('series')
    .select('id, name')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}
