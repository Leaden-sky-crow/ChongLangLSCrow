# 任务列表

## 管理后台站内通知功能

### 1. 后端开发
- [ ] 创建 `searchUsersForNotifications` server action - 支持按用户名、邮箱搜索用户
- [ ] 扩展 `createNotification` server action - 支持批量发送给多个用户
- [ ] 创建 `sendSystemNotifications` server action - 封装完整的系统通知发送逻辑

### 2. 前端组件开发
- [ ] 创建 `components/admin/notifications-management.tsx` 组件
- [ ] 实现用户搜索和选择功能（支持多选）
- [ ] 实现通知表单（标题、内容、链接URL）
- [ ] 添加表单验证和提交逻辑
- [ ] 集成 toast 通知反馈

### 3. 管理后台集成
- [ ] 在 `app/admin/page.tsx` 中导入并使用 `NotificationsManagement` 组件
- [ ] 替换现有的 "通知 (WIP)" 占位内容
- [ ] 测试完整的通知发送流程

## 主页分类切换自动滚动功能

### 4. 自动滚动实现
- [ ] 修改 `components/category-filter.tsx` 组件
- [ ] 添加平滑滚动到 `#content` 容器的逻辑
- [ ] 实现防抖机制避免重复滚动
- [ ] 确保只在主页 (`/`) 触发，不影响 `/posts` 页面

### 5. 用户体验优化
- [ ] 调整滚动延迟时间（300ms）
- [ ] 测试移动端和桌面端兼容性
- [ ] 验证滚动后页面状态正常

## 文档更新

### 6. NOTES.md 更新
- [ ] 记录站内通知功能的实现细节
- [ ] 记录自动滚动功能的实现细节
- [ ] 更新技术栈总结和待办事项
- [ ] 添加使用指南和注意事项