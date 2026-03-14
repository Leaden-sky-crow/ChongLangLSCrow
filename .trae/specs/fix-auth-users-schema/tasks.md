# Tasks

- [x] Task 1: 修复 searchUsersForNotifications 查询 auth.users 表错误
  - [x] 创建 PostgreSQL 函数 get_user_emails 安全获取邮箱
  - [x] 修改查询语法，使用 .rpc() 调用函数
  - [x] 测试查询功能
  - [x] 处理权限问题

- [ ] Task 2: 验证搜索功能
  - [ ] 测试搜索昵称
  - [ ] 测试搜索邮箱（需要额外实现）
  - [ ] 测试空搜索（显示所有用户）
  - [ ] 验证无 schema 错误
