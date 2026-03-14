# 项目开发笔记 - ChongLangLSCrow

本文档记录了本次开发会话中的所有修改和操作。

## 目录
- [UI 组件修复](#ui-组件修复)
- [登录与认证](#登录与认证)
- [页面布局优化](#页面布局优化)
- [Hero 区域优化](#hero-区域优化)
- [导航栏增强](#导航栏增强)
- [后台管理系统](#后台管理系统)
- [创作页面优化](#创作页面优化)
- [管理后台站内通知功能](#管理后台站内通知功能)
- [主页分类切换自动滚动功能](#主页分类切换自动滚动功能)

---

## UI 组件修复

### 1. Hydration Error 修复
**问题**: Button 嵌套导致的 Hydration Error 和 `Base UI: MenuGroupRootContext is missing` 错误

**原因**: Shadcn/UI v4 基于 @base-ui/react，不再支持 `asChild` 模式

**解决方案**:
- 移除 `DropdownMenuTrigger` 上的 `asChild` 属性
- 直接使用 `buttonVariants` 应用到触发组件上
- 修改文件：
  - `components/mode-toggle.tsx`
  - `components/user-nav.tsx`
  - `components/admin/posts-table.tsx`

### 2. Ecmascript Error 修复
**问题**: `./app/login/page.tsx (15:14)` - 无法在 Client Component 中导出 metadata

**解决方案**:
- 为所有需要 metadata 的页面创建 `layout.tsx` 文件
- 将 metadata 导出从 `page.tsx` 移到 `layout.tsx`
- 涉及页面：
  - `/app/login/layout.tsx`
  - `/app/register/layout.tsx`
  - `/app/create/layout.tsx`
  - `/app/profile/layout.tsx`
  - `/app/admin/layout.tsx`
  - `/app/search/layout.tsx`

---

## 登录与认证

### 1. Supabase 管理员设置
**操作**: 为用户邮箱 `xiongjinan29@gmail.com` 验证并提权为管理员

**实现**:
- 创建数据库迁移 SQL
- 通过 Supabase 后台执行验证和角色提升

### 2. 登录状态延迟问题
**问题**: 登录后需要刷新页面才能显示登录状态

**解决方案**:
- 将 `router.push('/')` 改为 `router.replace('/')`
- 保留 `router.refresh()` 强制服务器组件重新渲染
- 文件：`app/login/page.tsx`

---

## 页面布局优化

### 1. 容器居中
**问题**: 网站内容向左偏移，没有居中

**解决方案**:
- 在 `globals.css` 中添加容器样式：
```css
.container {
  @apply mx-auto px-4 w-full max-w-7xl;
}
```

### 2. 内容被顶栏遮挡
**问题**: `/posts` 和 `/about` 页面的文章列表与顶栏重合

**解决方案**:
- 增加页面顶部 padding：从 `py-8` 改为 `py-20`
- 文件：
  - `app/posts/page.tsx`
  - `app/about/page.tsx`

### 3. 创建 About 页面
**问题**: `/about` 显示 404

**解决方案**:
- 创建 `app/about/page.tsx` 文件
- 添加基本的关于页面内容

---

## Hero 区域优化

### 1. 全屏背景显示
**需求**: 背景图片铺满全屏，页面下滑才出现分类

**修改**:
- 高度从 `h-[80vh]` 改为 `h-screen`
- 文件：`components/hero-section.tsx`

### 2. 滚动指示器优化
**需求**: 跳动的鼠标换成向下的箭头，并上移

**修改**:
- 替换图标组件
- 调整位置和动画

### 3. 标题和引言位置优化
**需求**: 引言和网站大标题上移，保持在视觉中心

**修改**:
- 调整垂直对齐和间距

### 4. 渐隐效果移除
**需求**: 去掉大标题的渐隐效果

**修改**:
- 移除相关的 Framer Motion 动画属性

---

## 导航栏增强

### 1. Favicon 显示
**需求**: 在顶栏标题左侧显示 favicon

**实现**:
- 在 `app/layout.tsx` 中配置 favicon
- 添加 icon 元数据

### 2. 日夜切换图标
**需求**: Light、Dark、System 选项左侧添加图标

**修改**:
- 文件：`components/mode-toggle.tsx`
- 添加 Lucide 图标：
  - `Sun` - Light 模式
  - `Moon` - Dark 模式
  - `Monitor` - System 模式

### 3. 分类图标
**需求**: 分类筛选的"小说"、"散文"、"诗歌"、"关于我"添加图标

**修改**:
- 文件：`components/category-filter.tsx`
- 添加图标：
  - `Book` - 小说
  - `Feather` - 散文
  - `Quote` - 诗歌
  - `User` - 关于我

### 4. 创作按钮和站内信箱
**需求**: 
- 顶栏添加创作按钮（带图标）
- 添加站内信箱图标（铃铛）

**实现**:
- 文件：`components/navbar.tsx`
- 添加图标：
  - `PenSquare` - 创作按钮
  - `Bell` - 站内信箱（通知）

---

## 后台管理系统

### 1. 数据库迁移
**新增表**: `notifications` 站内通知表

**字段**:
- `id` - UUID 主键
- `user_id` - 接收用户 ID
- `title` - 通知标题
- `content` - 通知内容
- `type` - 通知类型（post_approved, post_rejected, post_hidden, post_deleted, user_action）
- `reference_id` - 关联 ID（投稿 ID 等）
- `is_read` - 是否已读
- `created_at` - 创建时间

**RLS 策略**:
- 用户只能查看自己的通知
- 系统可以插入通知

### 2. 投稿审核页面
**功能**:
- 通过/拒绝投稿
- 拒绝时填写原因
- 自动通知作者

**组件**: `components/admin/posts-management.tsx`

### 3. 文章管理
**功能**:
- 隐藏/删除文章
- 批量操作
- 状态筛选（待审核/已通过/已拒绝/已隐藏）
- 搜索功能

### 4. 用户管理
**功能**:
- 封禁/解封用户
- 提升/撤销管理员权限
- 用户搜索

**组件**: `components/admin/users-management.tsx`

### 5. 统计概览
**功能**:
- 用户总数
- 投稿总数
- 待审核数
- 通知统计

### 6. GitHub 链接
**功能**: 在后台管理页面添加 GitHub 仓库链接

---

## 创作页面优化

### 1. 中文分类显示
**需求**: 分类选项显示中文

**修改**:
- 文件：`app/create/page.tsx`
- 选项：
  - `novel` → 小说
  - `essay` → 散文
  - `poetry` → 诗歌

### 2. 系列管理
**需求**: 
- 系列选项"none"改为"无"
- 添加系列管理界面（新建/删除/重命名）

**实现**:
- 文件：`app/create/page.tsx`
- 添加系列管理 Dialog
- 功能：
  - 新建系列
  - 编辑系列名称
  - 删除系列
  - 实时刷新系列列表

### 3. 图床推荐
**需求**: 封面图下方加入醒目的图床推荐

**实现**:
- 添加推荐文字和链接
- 使用醒目颜色（橙色）
- 推荐图床：`https://s.ee`

### 4. 标题框提示词移除
**需求**: 删除"请输入引人入胜的标题..."placeholder

**修改**:
- 移除 Input 组件的 placeholder 属性

### 5. 分类/系列显示修复 ⭐ 最新
**问题**: 选择后显示英文值而非中文标签

**解决方案**:
- 添加 `categoryLabels` 映射对象
- 在 `SelectValue` 中根据 value 显示对应中文
- 系列选择器同样处理，查找对应系列名称

**代码示例**:
```tsx
const categoryLabels: Record<string, string> = {
  novel: '小说',
  essay: '散文',
  poetry: '诗歌',
}

// 分类选择器
<SelectValue placeholder="选择分类">
  {formData.category ? categoryLabels[formData.category] : '选择分类'}
</SelectValue>

// 系列选择器
<SelectValue placeholder="选择系列">
  {formData.series_id && formData.series_id !== 'none' 
    ? seriesList.find(s => s.id === formData.series_id)?.name || '选择系列'
    : '无'
  }
</SelectValue>
```

### 6. 系列管理浮窗 ⭐ 最新
**需求**: 系列旁边添加管理按钮，点击弹出浮窗

**实现**:
- 使用 Dialog 组件
- 添加设置图标按钮 (`Settings2`)
- 浮窗功能：
  - 新建系列（输入框 + 添加按钮）
  - 系列列表展示
  - 编辑功能（Edit2 图标）
  - 删除功能（Trash2 图标，带确认）
  - 空状态提示

**状态管理**:
```tsx
const [seriesDialogOpen, setSeriesDialogOpen] = useState(false)
const [newSeriesName, setNewSeriesName] = useState('')
const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null)
const [editingSeriesName, setEditingSeriesName] = useState('')
```

**管理函数**:
- `handleCreateSeries` - 创建新系列
- `handleDeleteSeries` - 删除系列
- `handleEditSeries` - 开始编辑
- `handleSaveEdit` - 保存编辑

---

## 管理后台站内通知功能

### 1. 功能概述
实现完整的站内通知发送功能，允许管理员向指定用户或全体用户发送系统通知。

### 2. 后端实现

#### 2.1 用户搜索 Server Action
**文件**: `app/admin/actions.ts`

**函数**: `searchUsersForNotifications(query: string)`

**功能**:
- 支持按用户名或邮箱搜索用户
- 空查询时返回所有用户（最多 50 个）
- 仅管理员可访问
- 返回用户 ID、昵称、头像 URL 和邮箱

**代码示例**:
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
    // Return all users if no query
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nickname, avatar_url, email')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) return { error: error.message }
    return { users: data || [] }
  }

  // Search by nickname or email
  const { data, error } = await supabase
    .from('profiles')
    .select('id, nickname, avatar_url, email')
    .or(`nickname.ilike.%${query}%,email.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) return { error: error.message }
  return { users: data || [] }
}
```

#### 2.2 发送系统通知 Server Action
**文件**: `app/admin/actions.ts`

**函数**: `sendSystemNotifications(userIds, title, content, linkUrl)`

**功能**:
- 支持发送给单个或多个指定用户
- 支持发送给全体用户（userIds 为空数组时）
- 输入验证：标题≤50 字符，内容≤500 字符
- 仅管理员可访问
- 自动排除被封禁用户

**代码示例**:
```typescript
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
```

### 3. 前端实现

#### 3.1 通知管理组件
**文件**: `components/admin/notifications-management.tsx`

**功能特性**:
- 用户搜索（支持防抖）
- 用户列表展示（带头像、用户名、邮箱）
- 多选用户功能
- 发送给全体用户选项
- 通知表单（标题、内容、可选链接）
- 实时字符计数
- 表单验证
- Toast 反馈

**状态管理**:
```typescript
const [searchQuery, setSearchQuery] = useState('')
const [users, setUsers] = useState<User[]>([])
const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set())
const [sendToAll, setSendToAll] = useState(false)
const [isLoading, setIsLoading] = useState(false)
const [isSearching, setIsSearching] = useState(false)
const [formData, setFormData] = useState({
  title: '',
  content: '',
  linkUrl: '',
})
```

**关键实现**:
1. **搜索防抖**: 300ms 延迟避免频繁请求
2. **用户选择**: 使用 Set 数据结构管理选中状态
3. **全体发送**: 空数组触发发送给所有非封禁用户
4. **表单验证**: 提交前验证必填字段和长度限制

### 4. 集成到管理后台
**文件**: `app/admin/page.tsx`

**修改**:
- 导入 `NotificationsManagement` 组件
- 替换"通知 (WIP)"占位内容
- 在通知 Tab 中渲染完整的通知管理界面

---

## 主页分类切换自动滚动功能

### 1. 功能概述
当用户在主页点击分类按钮时，自动平滑滚动到分类内容区域，提升用户体验。

### 2. 实现细节

**文件**: `components/category-filter.tsx`

**核心实现**:
```typescript
useEffect(() => {
  if (pathname === '/' && currentCategory) {
    const timeoutId = setTimeout(() => {
      const contentElement = document.getElementById('content')
      if (contentElement) {
        contentElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        })
      }
    }, 100)

    return () => clearTimeout(timeoutId)
  }
}, [pathname, currentCategory])
```

### 3. 技术要点

#### 3.1 路由检测
- 使用 `usePathname()` 获取当前路径
- 仅在主页 (`/`) 触发滚动
- `/posts` 页面保持原有行为

#### 3.2 滚动目标
- 目标元素：`#content` 容器
- 包含 CategoryFilter 和 PostList 的区域
- 使用 `scrollIntoView` API 实现

#### 3.3 滚动效果
- `behavior: 'smooth'` - 平滑滚动
- `block: 'start'` - 滚动到元素顶部
- 延迟 100ms 确保路由切换完成

#### 3.4 清理机制
- 使用 `useEffect` 的 cleanup 函数
- 组件卸载或依赖变化时清除定时器
- 避免内存泄漏和重复滚动

### 4. 用户体验优化
- 滚动过程平滑自然（约 300-500ms）
- 不影响其他页面的正常行为
- 移动端和桌面端都适用
- URL 参数正确更新，支持浏览器前进/后退

---

## 技术栈总结

### 前端框架
- **Next.js 15** - App Router
- **React 19** - 使用 Client Components 和 Server Components
- **TypeScript** - 类型安全

### UI 组件
- **Shadcn/UI v4** - 基于 @base-ui/react
- **Tailwind CSS v4** - 原子化 CSS
- **Framer Motion** - 动画效果
- **Lucide React** - 图标库

### 后端服务
- **Supabase** - 数据库、认证、存储
- **PostgreSQL** - 关系型数据库
- **RLS (Row Level Security)** - 行级安全策略

### 状态管理
- **React Hooks** - useState, useEffect, useSearchParams
- **Next.js Router** - useRouter, usePathname
- **localStorage** - 草稿自动保存

### 编辑器
- **@uiw/react-md-editor** - Markdown 编辑器

---

## 待办事项

1. **通知系统 UI**: 实现用户查看通知的界面（铃铛图标功能）
2. **系列管理后端**: 实现 createSeries, updateSeries, deleteSeries server actions
3. **通知读取状态**: 实现标记通知为已读功能
4. **更多统计图表**: 后台管理添加可视化统计

---

## 已完成功能 ⭐ 最新

### 2026-03-14

1. **管理后台站内通知功能** ✅
   - 用户搜索（按用户名/邮箱）
   - 多选用户发送
   - 全体用户广播
   - 表单验证（标题≤50 字符，内容≤500 字符）
   - Toast 反馈
   - 完整的错误处理

2. **主页分类切换自动滚动** ✅
   - 平滑滚动到内容区域
   - 仅主页触发，不影响 /posts 页面
   - 100ms 延迟确保路由切换完成
   - 支持移动端和桌面端

---

## 重要提示

### 安全注意事项
- 所有管理员操作都需要验证用户角色
- RLS 策略确保用户只能访问自己的数据
- 不提交任何密钥到版本控制

### 代码风格
- 使用函数式组件
- 优先使用 Server Components
- Client Components 仅在需要交互时使用
- 遵循现有的命名约定和代码模式

---

**文档更新时间**: 2026-03-14
**最后修改内容**: 管理后台站内通知功能实现、主页分类切换自动滚动功能实现
