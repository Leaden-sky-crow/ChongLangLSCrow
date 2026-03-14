# 优化主页分类切换体验 Spec

## Why
当前主页分类切换功能存在两个问题：
1. 访问主页时如果 URL 带有 category 参数（如从其他页面跳转过来），会自动滚动到内容区域，影响用户体验
2. 点击分类按钮会跳转页面（URL 变化），导致页面刷新，不够流畅

用户希望实现无感的分类切换体验，保持当前页面不跳转。

## What Changes
- 移除页面加载时的自动滚动逻辑
- 使用客户端状态管理替代 URL 参数
- 点击分类按钮时只更新状态，不跳转页面
- 主页和 /posts 页面都使用状态管理而非 URL 参数

## Impact
- 受影响文件：
  - `components/category-filter.tsx` - 分类筛选组件
  - `app/page.tsx` - 主页（需要接收分类状态）
  - `app/posts/page.tsx` - 文章列表页（可选）
- 不影响其他功能
- 非破坏性变更

## ADDED Requirements
### Requirement: 分类状态管理
系统 SHALL 使用客户端状态管理当前选中的分类，而非 URL 参数

#### Scenario: 用户点击分类按钮
- **WHEN** 用户在主页点击分类按钮
- **THEN** 只显示对应分类的文章，不跳转页面
- **THEN** URL 保持不变（或可选更新但不刷新）
- **THEN** 无页面滚动或跳动

### Requirement: 移除自动滚动
系统 SHALL 移除页面加载时的自动滚动逻辑

#### Scenario: 访问主页
- **WHEN** 用户访问主页（无论是否有 category 参数）
- **THEN** 页面不自动滚动
- **THEN** 用户保持在当前位置

## MODIFIED Requirements
### Requirement: CategoryFilter 组件
将基于 URL 参数的实现改为基于客户端状态的实现

**原实现**：
```typescript
const currentCategory = searchParams.get('category') || 'all'
const handleCategoryClick = (categoryId: string) => {
  router.push(`${targetBase}?category=${categoryId}`)
}
```

**修改后**：
```typescript
const [selectedCategory, setSelectedCategory] = useState('all')
const handleCategoryClick = (categoryId: string) => {
  setSelectedCategory(categoryId)
}
```

### Requirement: 主页组件
主页 SHALL 接收分类状态并过滤显示文章

**修改**：
- 添加分类状态管理
- 根据选中分类过滤文章列表
- 传递状态给 CategoryFilter 组件
