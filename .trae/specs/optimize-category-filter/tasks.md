# Tasks

- [x] Task 1: 修改 CategoryFilter 组件为纯客户端组件
  - [x] 使用 useState 管理选中分类
  - [x] 移除 useSearchParams 和自动滚动逻辑
  - [x] 修改 handleCategoryClick 只更新状态
  - [x] 添加 onCategoryChange 回调 prop

- [x] Task 2: 修改主页组件
  - [x] 添加分类状态管理
  - [x] 根据分类过滤文章列表
  - [x] 传递 selectedCategory 和 onCategoryChange 给 CategoryFilter
  - [x] 保持 URL 不变或使用 shallow routing

- [x] Task 3: 验证功能
  - [x] 测试点击分类按钮不跳转
  - [x] 测试文章列表正确过滤
  - [x] 测试无自动滚动
  - [x] 测试分类按钮高亮正确
