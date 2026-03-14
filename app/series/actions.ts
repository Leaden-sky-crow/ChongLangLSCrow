'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSeries(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const description = formData.get('description') as string

  const { error } = await supabase.from('series').insert({
    author_id: user.id,
    name,
    description,
  })

  if (error) return { error: error.message }
  revalidatePath('/profile')
  return { success: true }
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
