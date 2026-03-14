'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUserNotifications(limit: number = 20) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    return { error: error.message }
  }

  // Get unread count
  const { count, error: countError } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (countError) {
    return { error: countError.message }
  }

  return { 
    notifications: notifications || [],
    unreadCount: count || 0
  }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Verify ownership
  const { data: notification } = await supabase
    .from('notifications')
    .select('user_id')
    .eq('id', notificationId)
    .single()

  if (!notification) {
    return { error: '通知不存在' }
  }

  if (notification.user_id !== user.id) {
    return { error: '无权操作此通知' }
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/')
  return { success: true }
}
