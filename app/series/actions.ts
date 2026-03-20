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
