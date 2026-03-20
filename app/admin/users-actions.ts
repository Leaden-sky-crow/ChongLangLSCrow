'use server'

import { createClient } from '@/utils/supabase/server'

export async function getUsers() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  // Verify admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()

  if (profile?.role !== 'admin') {
    return { error: 'Unauthorized' }
  }

  // Get all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, nickname, avatar_url, role, is_banned, created_at')
    .order('created_at', { ascending: false })

  if (profilesError) {
    return { error: profilesError.message }
  }
  
  if (!profiles || profiles.length === 0) {
    return { users: [] }
  }

  // Get emails from auth.users using the RPC function
  const userIds = profiles.map(p => p.id)
  const { data: authData, error: getEmailsError } = await supabase
    .rpc('get_user_emails', { user_ids: userIds })
  
  if (getEmailsError) {
    return { error: getEmailsError.message }
  }

  // Get post counts
  const { data: postsData } = await supabase
    .from('posts')
    .select('author_id')
    .in('author_id', userIds)

  // Get comment counts
  const { data: commentsData } = await supabase
    .from('comments')
    .select('user_id')
    .in('user_id', userIds)

  // Count posts and comments per user
  const postCountMap = new Map<string, number>()
  const commentCountMap = new Map<string, number>()

  postsData?.forEach(post => {
    const currentCount = postCountMap.get(post.author_id) || 0
    postCountMap.set(post.author_id, currentCount + 1)
  })

  commentsData?.forEach(comment => {
    const currentCount = commentCountMap.get(comment.user_id) || 0
    commentCountMap.set(comment.user_id, currentCount + 1)
  })

  // Combine profiles with auth data and counts
  const users = profiles.map(p => ({
    id: p.id,
    nickname: p.nickname || '未知用户',
    avatar_url: p.avatar_url,
    role: p.role || 'user',
    is_banned: p.is_banned || false,
    created_at: p.created_at,
    email: authData?.find((u: any) => u.user_id === p.id)?.user_email || 'N/A',
    postCount: postCountMap.get(p.id) || 0,
    commentCount: commentCountMap.get(p.id) || 0,
  }))
  
  return { users }
}
