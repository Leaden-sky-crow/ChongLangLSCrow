'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// --- Notifications ---

export async function createNotification(userId: string, title: string, content: string, type: 'system' | 'post_status' | 'comment' | 'like', linkUrl?: string) {
  const supabase = await createClient()
  // Admin check or system role check is handled by RLS or context
  // Here we assume this is called from an admin action or system event
  
  await supabase.from('notifications').insert({
    user_id: userId,
    title,
    content,
    type,
    link_url: linkUrl,
  })
}

export async function searchUsersForNotifications(query: string) {
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

  if (!query || query.trim().length === 0) {
    // Return all users if no query - get profiles with auth users email
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, nickname, avatar_url, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return { error: error.message }
    
    if (!profiles || profiles.length === 0) {
      return { users: [] }
    }

    // Get emails from auth.users using the RPC function
    const userIds = profiles.map(p => p.id)
    const { data: authData, error: authError } = await supabase
      .rpc('get_user_emails', { user_ids: userIds })
    
    if (authError) return { error: authError.message }
    
    // Combine profiles with auth data
    const users = profiles.map(p => ({
      id: p.id,
      nickname: p.nickname,
      avatar_url: p.avatar_url,
      email: authData?.find((u: any) => u.user_id === p.id)?.user_email || null,
    }))
    
    return { users }
  }

  // Search by nickname in profiles table
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, nickname, avatar_url')
    .ilike('nickname', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (profilesError) return { error: profilesError.message }
  
  if (!profiles || profiles.length === 0) {
    // If no nickname match, try searching by email
    // Note: We can't directly search auth.users by email from client
    // So we return empty or get all users and filter client-side
    return { users: [] }
  }
  
  // Get emails from auth.users using RPC function
  const userIds = profiles.map(p => p.id)
  const { data: authData, error: authError } = await supabase
    .rpc('get_user_emails', { user_ids: userIds })
  
  if (authError) return { error: authError.message }
  
  // Combine profiles with auth data
  const users = profiles.map(p => ({
    id: p.id,
    nickname: p.nickname,
    avatar_url: p.avatar_url,
    email: authData?.find((u: any) => u.user_id === p.id)?.user_email || null,
  }))
  
  return { users }
}

export async function sendSystemNotifications(
  userIds: string[],
  title: string,
  content: string,
  linkUrl?: string
) {
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

  // Validate input
  if (!title || title.trim().length === 0) {
    return { error: '标题不能为空' }
  }
  if (title.length > 50) {
    return { error: '标题不能超过 50 个字符' }
  }
  if (!content || content.trim().length === 0) {
    return { error: '内容不能为空' }
  }
  if (content.length > 500) {
    return { error: '内容不能超过 500 个字符' }
  }

  // Send to all users if no specific users selected
  let targetUserIds = userIds
  if (userIds.length === 0) {
    // Get all user IDs
    const { data: allUsers } = await supabase
      .from('profiles')
      .select('id')
      .eq('is_banned', false)

    targetUserIds = allUsers?.map(u => u.id) || []
  }

  // Insert notifications
  const notifications = targetUserIds.map(userId => ({
    user_id: userId,
    title,
    content,
    type: 'system' as const,
    link_url: linkUrl,
  }))

  const { error } = await supabase
    .from('notifications')
    .insert(notifications)

  if (error) return { error: error.message }

  return { success: true, count: targetUserIds.length }
}

// --- Post Management ---

export async function updatePostStatus(postId: string, status: string, rejectReason?: string) {
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

  const updateData: any = { status, updated_at: new Date().toISOString() }
  if (status === 'rejected' && rejectReason) {
    updateData.reject_reason = rejectReason
  }

  const { data: post, error } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', postId)
    .select('author_id, title')
    .single()

  if (error) return { error: error.message }

  // Create Notification
  if (status === 'published') {
    await createNotification(post.author_id, '投稿通过', `您的文章《${post.title}》已审核通过并发布。`, 'post_status', `/posts/${postId}`)
  } else if (status === 'rejected') {
    await createNotification(post.author_id, '投稿被拒', `您的文章《${post.title}》未通过审核。原因：${rejectReason}`, 'post_status', '/profile')
  } else if (status === 'hidden') {
    await createNotification(post.author_id, '文章隐藏', `您的文章《${post.title}》已被管理员隐藏。`, 'post_status', '/profile')
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function deletePost(postId: string) {
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

  // Get post details before deleting for notification
  const { data: post } = await supabase.from('posts').select('author_id, title').eq('id', postId).single()

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', postId)

  if (error) return { error: error.message }

  if (post) {
    await createNotification(post.author_id, '文章删除', `您的文章《${post.title}》已被管理员删除。`, 'system')
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function batchUpdatePostStatus(postIds: string[], status: string) {
  // Loop for now to trigger notifications correctly, or optimize later
  for (const id of postIds) {
    await updatePostStatus(id, status)
  }
  revalidatePath('/admin')
  return { success: true }
}

// --- User Management ---

export async function toggleUserBan(userId: string, isBanned: boolean) {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error: getUserError } = await supabase.auth.getUser()
    
    if (getUserError || !user) {
      console.error('获取用户失败:', getUserError)
      return { error: '未授权' }
    }

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('获取管理员资料失败:', profileError)
      return { error: '获取管理员信息失败' }
    }
    
    if (profile?.role !== 'admin') {
      console.error('用户不是管理员:', user.id)
      return { error: '未授权' }
    }

    console.log('管理员封禁操作:', { 
      adminId: user.id, 
      targetUserId: userId, 
      isBanned,
      timestamp: new Date().toISOString() 
    })

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ is_banned: isBanned })
      .eq('id', userId)

    if (updateError) {
      console.error('更新用户状态失败:', updateError)
      return { error: `更新失败：${updateError.message}` }
    }
    
    if (isBanned) {
      await createNotification(userId, '账号封禁', '您的账号已被管理员封禁。', 'system')
    } else {
      await createNotification(userId, '账号解封', '您的账号已解除封禁。', 'system')
    }

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('封禁操作异常:', error)
    return { error: `操作失败：${error instanceof Error ? error.message : '未知错误'}` }
  }
}

export async function toggleUserRole(userId: string, isAdmin: boolean) {
  const supabase = await createClient()
  
  try {
    const { data: { user }, error: getUserError } = await supabase.auth.getUser()
    
    if (getUserError || !user) {
      console.error('获取用户失败:', getUserError)
      return { error: '未授权' }
    }

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('获取管理员资料失败:', profileError)
      return { error: '获取管理员信息失败' }
    }
    
    if (profile?.role !== 'admin') {
      console.error('用户不是管理员:', user.id)
      return { error: '未授权' }
    }

    const role = isAdmin ? 'admin' : 'user'
    
    console.log('管理员提权操作:', { 
      adminId: user.id, 
      targetUserId: userId, 
      newRole: role,
      timestamp: new Date().toISOString() 
    })

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)

    if (updateError) {
      console.error('更新用户角色失败:', updateError)
      return { error: `更新失败：${updateError.message}` }
    }
    
    await createNotification(userId, '权限变更', `您的账号权限已变更为：${role === 'admin' ? '管理员' : '普通用户'}。`, 'system')

    revalidatePath('/admin')
    return { success: true }
  } catch (error) {
    console.error('提权操作异常:', error)
    return { error: `操作失败：${error instanceof Error ? error.message : '未知错误'}` }
  }
}
