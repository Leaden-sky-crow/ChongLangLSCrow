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

  const postData: any = {
    author_id: user.id,
    title,
    content,
    summary,
    category,
    status,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (series_id && series_id !== 'none') {
    postData.series_id = series_id
  }

  const { error } = await supabase.from('posts').insert(postData)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  revalidatePath('/profile')
  return { success: true }
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
