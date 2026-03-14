'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const validatedFields = schema.safeParse(data)

  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: '邮箱或密码错误' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    nickname: formData.get('nickname') as string,
  }

  const validatedFields = schema.safeParse({ email: data.email, password: data.password })

  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        nickname: data.nickname,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  // Depending on email verification settings, we might want to redirect to a verification page
  return { success: 'Check your email to continue sign in process' }
}

export async function signout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/login')
}
