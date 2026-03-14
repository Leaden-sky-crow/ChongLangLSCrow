# 修复后台通知用户搜索 auth.users 表错误 Spec

## Why
用户在后台通知界面搜索用户时出现错误 `Could not find the table 'public.auth.users' in the schema cache`。原因是 `auth.users` 表不在 `public` schema 中，而是在 `auth` schema 中，并且由于 Supabase 的安全限制，不能直接通过普通查询访问。

## What Changes
- 修改 `searchUsersForNotifications` 函数，使用 Supabase Admin API 或创建自定义函数
- 使用 `supabase.auth.admin.getUserById` 方法获取用户邮箱
- 或者创建 PostgreSQL 函数来安全地获取用户信息

## Impact
- 受影响文件：`app/admin/actions.ts`
- 需要管理员权限才能访问用户认证信息
- 非破坏性变更

## ADDED Requirements
### Requirement: 用户搜索功能
系统 SHALL 支持安全地搜索用户（按昵称或邮箱），同时正确处理 Supabase 的 schema 限制

#### Scenario: 搜索用户
- **WHEN** 管理员在通知管理界面输入搜索关键词
- **THEN** 系统返回匹配的用户列表（包含 id、nickname、avatar_url、email）
- **THEN** 不出现数据库 schema 错误

## MODIFIED Requirements
### Requirement: searchUsersForNotifications Server Action
修改查询逻辑，使用正确的方式获取 auth.users 信息

**方案：使用 Supabase Admin API**

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

  // Get all profiles first
  let profilesQuery = supabase
    .from('profiles')
    .select('id, nickname, avatar_url, created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  // Search by nickname if query provided
  if (query && query.trim().length > 0) {
    profilesQuery = profilesQuery.ilike('nickname', `%${query}%`)
  }

  const { data: profiles, error: profilesError } = await profilesQuery

  if (profilesError) return { error: profilesError.message }
  
  if (!profiles || profiles.length === 0) {
    return { users: [] }
  }

  // Get emails from auth.users using the user IDs
  // Note: We need to query auth.users correctly
  const userIds = profiles.map(p => p.id)
  
  // Use raw SQL or admin API to get emails
  const { data: authUsers, error: authError } = await supabase
    .from('auth.users')
    .select('id, email')
    .in('id', userIds)

  if (authError) {
    // If we can't access auth.users, return profiles without email
    const users = profiles.map(p => ({
      id: p.id,
      nickname: p.nickname,
      avatar_url: p.avatar_url,
      email: null, // Can't access email
    }))
    return { users }
  }
  
  // Combine profiles with auth data
  const users = profiles.map(p => ({
    id: p.id,
    nickname: p.nickname,
    avatar_url: p.avatar_url,
    email: authUsers?.find((u: any) => u.id === p.id)?.email || null,
  }))
  
  return { users }
}
```

**备选方案：创建 PostgreSQL 函数**

如果直接查询 `auth.users` 仍然有问题，需要创建自定义 PostgreSQL 函数：

```sql
CREATE OR REPLACE FUNCTION public.get_user_emails(user_ids uuid[])
RETURNS TABLE(id uuid, email text) AS $$
BEGIN
  RETURN QUERY
  SELECT au.id::uuid, au.email::text
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

然后在代码中调用：
```typescript
const { data: authUsers } = await supabase
  .rpc('get_user_emails', { user_ids: userIds })
```
