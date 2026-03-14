# 修复后台通知用户搜索功能 Spec

## Why
用户在后台通知功能中搜索不到用户，原因是 `searchUsersForNotifications` server action 尝试从 `profiles` 表查询 `email` 字段，但 `email` 实际存储在 Supabase 的 `auth.users` 表中，`profiles` 表只包含 `nickname`、`avatar_url` 等字段。

## What Changes
- 修改 `searchUsersForNotifications` 函数，从 `auth.users` 表获取 email
- 使用 JOIN 或分别查询 profiles 和 auth.users
- 保持搜索功能支持按 nickname 和 email 搜索

## Impact
- 受影响文件：`app/admin/actions.ts`
- 需要访问 auth.users 表（管理员权限）
- 非破坏性变更

## ADDED Requirements
### Requirement: 用户搜索功能
系统 SHALL 支持按用户名（nickname）和邮箱（email）搜索用户

#### Scenario: 搜索用户
- **WHEN** 管理员在通知管理界面输入搜索关键词
- **THEN** 系统返回匹配的用户列表（包含 id、nickname、avatar_url、email）
- **THEN** 搜索支持模糊匹配 nickname 和 email

## MODIFIED Requirements
### Requirement: searchUsersForNotifications Server Action
修改查询逻辑，正确获取用户的 email 信息

```typescript
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
    // Return all users if no query - join with auth.users for email
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        nickname,
        avatar_url,
        created_at,
        auth_users:auth.users!inner(email)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return { error: error.message }
    const users = (data || []).map(p => ({
      id: p.id,
      nickname: p.nickname,
      avatar_url: p.avatar_url,
      email: (p as any).auth_users?.email || null,
    }))
    return { users }
  }

  // Search by nickname in profiles table
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select(`
      id,
      nickname,
      avatar_url,
      created_at
    `)
    .ilike('nickname', `%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return { error: error.message }
  
  // Get emails from auth.users for the found profiles
  const userIds = profiles?.map(p => p.id) || []
  const { data: authData, error: authError } = await supabase
    .from('auth.users')
    .select('id, email')
    .in('id', userIds)
  
  if (authError) return { error: authError.message }
  
  // Combine profiles with auth data
  const users = profiles.map(p => ({
    id: p.id,
    nickname: p.nickname,
    avatar_url: p.avatar_url,
    email: authData?.find(u => u.id === p.id)?.email || null,
  }))
  
  return { users }
}
```
