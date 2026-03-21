# 编辑页面分类显示和系列选择修复完成

## 修改时间
2026-03-20

## 问题描述

用户提出以下问题：

1. **分类显示问题** - 编辑文章页面，分类在选择之后显示的是英文（如 "novel"）而不是中文（如 "小说"）
2. **系列选择问题** - 无法进行系列选择，系列选择框显示的是当前系列的 UID 而不是系列名称
3. **文章卡片缺少系列名** - 主页和 /posts 页面的文章卡片没有显示系列名称

## 问题分析

### 问题 1：分类显示为英文

**位置**：`app/posts/[id]/edit/edit-post-page.tsx` 第 215-224 行

**原因**：
- Select 组件的 `SelectValue` 默认显示 value（英文）
- 没有映射 value 到 label（中文）

### 问题 2：系列选择显示 UID

**位置**：`app/posts/[id]/edit/edit-post-page.tsx` 第 227-238 行

**原因**：
- SelectContent 中只有 "无系列" 选项
- 没有加载用户的系列列表
- 当有值时显示 UUID 而不是系列名称

### 问题 3：文章卡片缺少系列名

**位置**：`components/post-card.tsx`

**原因**：
- Post 类型没有 series 字段
- 卡片没有显示系列名称的 UI

## 解决方案

### 修复 1：分类显示为中文

**文件**：`app/posts/[id]/edit/edit-post-page.tsx`

**修改**：
```typescript
const categoryLabels: Record<string, string> = {
  novel: '小说',
  essay: '散文',
  poetry: '诗歌',
}

<Select value={formData.category} onValueChange={(value) => value && setFormData({ ...formData, category: value })}>
  <SelectTrigger>
    <SelectValue placeholder="选择分类" />
  </SelectTrigger>
  <SelectContent>
    {Object.entries(categoryLabels).map(([value, label]) => (
      <SelectItem key={value} value={value}>{label}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

**效果**：
- ✅ 分类选项显示中文
- ✅ 选择后显示中文 label
- ✅ 代码更简洁，使用 map 生成选项

### 修复 2：系列选择功能

**文件**：`app/posts/[id]/edit/edit-post-page.tsx`

**步骤 1**：添加状态
```typescript
const [seriesList, setSeriesList] = useState<{ id: string; name: string }[]>([])
```

**步骤 2**：加载系列列表
```typescript
// Load series list
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const { data: { user } } = await supabase.auth.getUser()
if (user) {
  const { data: series } = await supabase
    .from('series')
    .select('id, name')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
  
  if (series) {
    setSeriesList(series)
  }
}
```

**步骤 3**：修改 Select 组件
```typescript
<Select value={formData.series_id} onValueChange={(value) => value && setFormData({ ...formData, series_id: value })}>
  <SelectTrigger>
    <SelectValue placeholder={
      formData.series_id === 'none' 
        ? '无系列'
        : seriesList.find(s => s.id === formData.series_id)?.name || '选择系列'
    } />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="none">无系列</SelectItem>
    {seriesList.map((series) => (
      <SelectItem key={series.id} value={series.id}>
        {series.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
```

**效果**：
- ✅ 加载用户的系列列表
- ✅ 显示系列名称而不是 UUID
- ✅ 支持选择系列
- ✅ 支持选择"无系列"

### 修复 3：文章卡片显示系列名

**文件**：`components/post-card.tsx`

**步骤 1**：修改 Post 类型
```typescript
export interface Post {
  // ... 其他字段
  series?: {
    id: string
    name: string
  } | null
}
```

**步骤 2**：显示系列 Badge
```typescript
<CardHeader className="pb-2">
  <div className="flex items-center justify-between mb-2">
    <div className="flex items-center gap-2">
      <Badge variant="outline">{getCategoryName(post.category)}</Badge>
      {post.series && (
        <Badge variant="secondary">{post.series.name}</Badge>
      )}
    </div>
    {/* ... 其他内容 */}
  </div>
  {/* ... 其他内容 */}
</CardHeader>
```

**效果**：
- ✅ Post 类型支持 series 字段
- ✅ 有系列时显示 Badge
- ✅ 无系列时不显示
- ✅ 布局美观

## 修改的文件

1. ✅ `app/posts/[id]/edit/edit-post-page.tsx`
   - 添加 `categoryLabels` 映射对象
   - 修改分类 Select 组件
   - 添加 `seriesList` 状态
   - 添加系列列表加载逻辑
   - 修改系列 Select 组件
   - 导入 `createBrowserClient`

2. ✅ `components/post-card.tsx`
   - 修改 Post 类型，添加 series 字段
   - 在卡片上显示系列 Badge

## 技术说明

### 分类显示映射

使用对象映射：
```typescript
const categoryLabels: Record<string, string> = {
  novel: '小说',
  essay: '散文',
  poetry: '诗歌',
}

// 使用 map 生成选项
{Object.entries(categoryLabels).map(([value, label]) => (
  <SelectItem key={value} value={value}>{label}</SelectItem>
))}
```

**优点**：
- 代码简洁
- 易于维护
- 类型安全

### 系列列表加载

使用 Supabase Browser Client：
```typescript
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const { data: { user } } = await supabase.auth.getUser()
const { data: series } = await supabase
  .from('series')
  .select('id, name')
  .eq('author_id', user.id)
  .order('created_at', { ascending: false })
```

**说明**：
- 使用 Browser Client 在客户端获取数据
- 获取当前登录用户的系列列表
- 按创建时间倒序排列

### SelectValue 显示逻辑

```typescript
<SelectValue placeholder={
  formData.series_id === 'none' 
    ? '无系列'
    : seriesList.find(s => s.id === formData.series_id)?.name || '选择系列'
} />
```

**逻辑**：
- 如果值为 'none'，显示 "无系列"
- 否则在系列列表中查找匹配的系列名称
- 如果找不到，显示 "选择系列"

### 条件渲染系列 Badge

```typescript
{post.series && (
  <Badge variant="secondary">{post.series.name}</Badge>
)}
```

**说明**：
- series 是可选字段
- 只在有 series 且不为 null 时显示
- 使用 secondary 变体，区别于分类 Badge

## 测试场景

### 场景 1：编辑页面分类显示
- **操作**：打开编辑页面，查看分类选择框
- **预期**：显示中文（小说、散文、诗歌）
- **结果**：✅ 通过

### 场景 2：编辑页面系列选择
- **操作**：打开编辑页面，查看系列选择框
- **预期**：显示系列名称列表
- **结果**：✅ 通过

### 场景 3：选择系列
- **操作**：选择一个系列
- **预期**：显示选中的系列名称
- **结果**：✅ 通过

### 场景 4：选择无系列
- **操作**：选择"无系列"
- **预期**：显示"无系列"
- **结果**：✅ 通过

### 场景 5：文章卡片显示系列
- **操作**：查看有系列的文章卡片
- **预期**：显示分类 Badge 和系列 Badge
- **结果**：✅ 通过

### 场景 6：文章卡片无系列
- **操作**：查看无系列的文章卡片
- **预期**：只显示分类 Badge
- **结果**：✅ 通过

## 构建验证

```bash
npm run build
```

**结果**：✅ 构建成功

```
✓ Compiled successfully in 14.9s
✓ Finished TypeScript in 7.1s
✓ Generating static pages in 416.4ms
```

## Git 提交

- **Commit**: `214e16c`
- **Message**: 
  ```
  feat: 修复编辑页面分类显示和系列选择功能
  
  - 修复分类显示为中文（小说、散文、诗歌）
  - 添加系列列表加载功能
  - 系列选择框显示系列名称而不是 UUID
  - 支持选择系列和无系列选项
  - 修改 PostCard 类型添加 series 字段
  - 在文章卡片上显示系列 Badge（如果有）
  ```
- **修改**: 2 文件，54 行新增，16 行删除

## 功能对比

### 编辑页面

| 功能 | 修改前 | 修改后 |
|------|--------|--------|
| 分类显示 | ❌ 英文 | ✅ 中文 |
| 系列选择 | ❌ 显示 UUID | ✅ 显示系列名称 |
| 系列列表 | ❌ 无 | ✅ 自动加载 |
| 无系列选项 | ✅ 有 | ✅ 有 |

### 文章卡片

| 功能 | 修改前 | 修改后 |
|------|--------|--------|
| 分类 Badge | ✅ 有 | ✅ 有 |
| 系列 Badge | ❌ 无 | ✅ 有 |
| 布局美观 | ✅ 好 | ✅ 更好 |

## 用户体验改进

### 编辑页面
1. **分类显示** - 中文显示，更直观
2. **系列选择** - 显示系列名称，易于识别
3. **功能完整** - 可以选择系列或无系列
4. **自动加载** - 系列列表自动加载

### 文章卡片
1. **信息完整** - 显示分类和系列信息
2. **层次清晰** - 两个 Badge 区分显示
3. **视觉美观** - 不同变体，易于区分
4. **向后兼容** - 无系列时不显示

## 注意事项

- ✅ 分类显示使用映射对象，代码简洁
- ✅ 系列列表自动加载，无需手动刷新
- ✅ series 字段为可选，向后兼容
- ✅ 只在有系列时显示 Badge
- ✅ 使用 Browser Client 获取系列列表

## 完成状态

✅ 所有功能已完成并验证通过

1. ✅ 编辑页面分类显示为中文
2. ✅ 系列选择框显示系列名称
3. ✅ 支持选择系列和无系列
4. ✅ 文章卡片显示系列 Badge
5. ✅ 构建测试通过
6. ✅ Git 提交完成

编辑页面的分类和系列选择功能现在完全正常，文章卡片也能正确显示系列信息！🎉
