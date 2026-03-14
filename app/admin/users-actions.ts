'use server'

import { createClient } from '@/utils/supabase/server'

export async function getUsers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Verify admin role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single()
  if (profile?.role !== 'admin') return []

  // First get all profiles with post and comment counts
  const { data: profilesData } = await supabase
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

  if (!profilesData) return []

  // Get emails from auth.users by mapping user IDs
  const userIds = profilesData.map(p => p.id)
  const { data: authData, error: authError } = await supabase.rpc('get_user_emails', {
    user_ids: userIds
  })

  // Create a map of user IDs to emails
  const emailMap = new Map()
  if (!authError && authData) {
    authData.forEach((item: any) => {
      emailMap.set(item.user_id, item.user_email)
    })
  }

  // Transform the data
  return profilesData.map((u: any) => ({
    ...u,
    postCount: Array.isArray(u.posts) && u.posts.length > 0 ? u.posts[0].count : 0,
    commentCount: Array.isArray(u.comments) && u.comments.length > 0 ? u.comments[0].count : 0,
    email: emailMap.get(u.id) || u.contact_info?.email || 'N/A'
  }))
}
