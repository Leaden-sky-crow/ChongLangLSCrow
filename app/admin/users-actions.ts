'use server'

import { createClient } from '@/utils/supabase/server'

export async function getUsers() {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      console.error('无法创建 Supabase 客户端')
      return []
    }
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.error('获取用户失败:', {
        error: authError,
        message: authError.message,
        code: authError.code,
        status: authError.status
      })
      return []
    }
    
    if (!user) {
      console.error('用户未登录或 token 已过期')
      return []
    }

    // Verify admin role with detailed error handling
    const { data: adminProfile, error: adminCheckError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (adminCheckError) {
      console.error('检查管理员权限失败:', {
        error: adminCheckError,
        message: adminCheckError.message,
        code: adminCheckError.code,
        details: adminCheckError.details,
        hint: adminCheckError.hint
      })
      return []
    }

    if (adminProfile?.role !== 'admin') {
      console.log('当前用户不是管理员，role:', adminProfile?.role)
      return []
    }

    // Get all profiles with detailed error logging
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, nickname, avatar_url, role, is_banned, created_at')
      .order('created_at', { ascending: false })

    if (profilesError) {
      console.error('获取 profiles 失败:', {
        error: profilesError,
        message: profilesError.message,
        code: profilesError.code,
        details: profilesError.details,
        hint: profilesError.hint
      })
      return []
    }

    console.log('获取到 profiles 数量:', profiles?.length || 0)

    if (!profiles || profiles.length === 0) {
      console.log('profiles 表为空或不存在')
      return []
    }

    // Get emails from auth.users using the RPC function
    const userIds = profiles.map(p => p.id)
    const { data: authData, error: getEmailsError } = await supabase
      .rpc('get_user_emails', { user_ids: userIds })

    if (getEmailsError) {
      console.error('获取邮箱失败:', getEmailsError)
    }

    console.log('获取到邮箱数据:', authData?.length || 0)

    // Get post counts for each user
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('author_id')
      .in('author_id', userIds)

    if (postsError) {
      console.error('获取 posts 失败:', postsError)
    }

    // Get comment counts for each user
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('user_id')
      .in('user_id', userIds)

    if (commentsError) {
      console.error('获取 comments 失败:', commentsError)
    }

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

    console.log('最终用户数据:', users.length)
    return users
  } catch (error) {
    console.error('getUsers 函数执行失败:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined
    })
    return []
  }
}
