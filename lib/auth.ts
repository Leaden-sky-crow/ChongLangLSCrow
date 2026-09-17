import { cache } from 'react'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/utils/supabase/server'

export interface CurrentProfile {
  nickname: string | null
  avatar_url: string | null
  role: string | null
}

// 当前登录用户 + 资料（React cache 去重：同一请求内 Navbar 与页面共享，auth.getUser 只查一次）
export const getCurrentUser = cache(
  async (): Promise<{ user: User | null; profile: CurrentProfile | null }> => {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { user: null, profile: null }
    }

    const { data } = await supabase
      .from('profiles')
      .select('nickname, avatar_url, role')
      .eq('id', user.id)
      .single()

    return { user, profile: (data as CurrentProfile) ?? null }
  }
)
