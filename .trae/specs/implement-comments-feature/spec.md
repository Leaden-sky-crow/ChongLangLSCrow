# 个人主页 - 我的评论功能 Spec

## Why
当前个人主页的"我的评论"标签页只显示"评论管理功能开发中..."的占位文本，用户无法查看和管理自己发表的评论。需要实现完整的评论列表展示功能，让用户能够查看、编辑和删除自己的评论。

## What Changes
- 实现获取用户评论的 server action
- 创建评论列表组件，展示用户的所有评论
- 支持评论的基本操作：查看评论、删除评论
- 添加评论所在文章的信息和跳转链接
- 显示评论的时间、状态等信息

## Impact
- 受影响文件：
  - `app/profile/page.tsx` - 个人主页组件
  - `app/profile/actions.ts` - 添加获取评论的 server action
  - 可能需要创建新的评论管理组件
- 不影响其他功能
- 非破坏性变更

## ADDED Requirements
### Requirement: 我的评论列表
系统 SHALL 在个人主页展示用户发表的所有评论

#### Scenario: 查看评论列表
- **WHEN** 用户访问个人主页并点击"我的评论"标签
- **THEN** 显示用户发表的所有评论（按时间倒序）
- **THEN** 每条评论显示：评论内容、所在文章、时间、状态
- **THEN** 提供删除评论的功能

### Requirement: 评论删除功能
系统 SHALL 允许用户删除自己发表的评论

#### Scenario: 删除评论
- **WHEN** 用户点击评论的删除按钮
- **THEN** 确认后删除评论
- **THEN** 列表自动刷新
- **THEN** 显示成功提示

## MODIFIED Requirements
### Requirement: 个人主页 - 我的评论标签页
将占位文本替换为实际的评论列表功能

**原状态**：
```tsx
<TabsContent value="comments">
  <div className="text-center text-muted-foreground py-8">
    评论管理功能开发中...
  </div>
</TabsContent>
```

**修改后**：
```tsx
<TabsContent value="comments">
  <CommentsList userId={user.id} />
</TabsContent>
```
