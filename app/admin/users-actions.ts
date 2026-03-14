'use server'

import { createClient } from '@/utils/supabase/server'

export async function getUsers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Verify admin role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  if (profile?.role !== 'admin') return []

  const { data: users } = await supabase
    .from('profiles')
    .select(`
      id,
      nickname,
      avatar_url,
      role,
      is_banned,
      created_at,
      contact_info,
      posts:posts(count),
      comments:comments(count)
    `)
    .order('created_at', { ascending: false })

  return users?.map((u: any) => ({
    ...u,
    postCount: Array.isArray(u.posts) && u.posts.length > 0 ? u.posts[0].count : 0,
    commentCount: Array.isArray(u.comments) && u.comments.length > 0 ? u.comments[0].count : 0,
    email: u.contact_info?.email || 'N/A' // Assuming email is stored in contact_info or need to fetch from auth.users (requires admin client)
  })) || []
}
