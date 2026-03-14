# 优化 UserNav UI 并修复数据库查询错误 Spec

## Why
1. **UI 优化需求**：当前用户头像下拉菜单 UI 过于简单，只有纯文本菜单项，缺少图标，视觉效果不够专业和美观
2. **数据库错误**：`get_user_emails` PostgreSQL 函数返回的表中 `id` 列与 profiles 表的 `id` 列在 JOIN 时产生歧义错误 `column reference "id" is ambiguous`

## What Changes
- **UI 优化**：
  - 为菜单项添加 Lucide 图标（User, PenSquare, LogOut）
  - 改进用户信息区域的布局和样式
  - 添加 hover 效果和过渡动画
  - 优化间距和字体层次
  
- **数据库错误修复**：
  - 修改 `get_user_emails` 函数，使用别名避免列名冲突
  - 或者修改 server action 中的数据处理逻辑

## Impact
- 受影响文件：
  - `components/user-nav.tsx` - UI 优化
  - `supabase/migrations/20240101000003_add_get_user_emails_function.sql` - 函数定义
  - `app/admin/actions.ts` - 查询逻辑（如果需要）
- 不影响其他功能
- 非破坏性变更

## ADDED Requirements
### Requirement: UserNav 菜单 UI
系统 SHALL 提供美观、专业的下拉菜单，包含图标和优化的视觉设计

#### Scenario: 用户点击头像
- **WHEN** 用户点击导航栏中的个人头像
- **THEN** 显示美观的下拉菜单，包含：
  - 用户信息区域（头像、昵称、邮箱）
  - 带图标的菜单项（Profile、Create、Log out）
  - 清晰的视觉层次和 hover 效果

### Requirement: 数据库查询无歧义
系统 SHALL 正确执行用户搜索查询，不出现列名歧义错误

#### Scenario: 搜索用户
- **WHEN** 调用 `searchUsersForNotifications` 函数
- **THEN** 正确返回用户列表（包含 id、nickname、avatar_url、email）
- **THEN** 不出现 `column reference "id" is ambiguous` 错误

## MODIFIED Requirements
### Requirement: get_user_emails 函数
修改函数返回列使用别名，避免与调用方的列名冲突

**原函数**：
```sql
RETURNS TABLE(id uuid, email text)
```

**修改后**：
```sql
RETURNS TABLE(user_id uuid, user_email text)
```

或者在 server action 中修改数据处理：
```typescript
// 明确指定列的别名
const users = profiles.map(p => ({
  id: p.id,
  nickname: p.nickname,
  avatar_url: p.avatar_url,
  email: authData?.find((u: any) => u.user_id === p.id)?.user_email || null,
}))
```
