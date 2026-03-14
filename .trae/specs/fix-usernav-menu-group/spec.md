# 修复 UserNav MenuGroupRootContext 错误 Spec

## Why
用户点击个人头像时出现错误 `Base UI: MenuGroupRootContext is missing. Menu group parts must be used within <Menu.Group>.`，这是因为 Shadcn/UI v4 基于 @base-ui/react，对 DropdownMenu 组件的使用有特定要求。

## What Changes
- 移除 `user-nav.tsx` 中的 `DropdownMenuGroup` 包装器
- 直接使用 `DropdownMenuItem` 而不使用 Group 包装
- 保持 `DropdownMenuSeparator` 分隔线的功能

## Impact
- 受影响文件：`components/user-nav.tsx`
- 不影响其他组件或功能
- 非破坏性变更

## MODIFIED Requirements
### Requirement: UserNav 组件
修复 DropdownMenu 结构，移除导致错误的 DropdownMenuGroup 包装器

#### Scenario: 用户点击头像
- **WHEN** 用户点击导航栏中的个人头像
- **THEN** DropdownMenu 正常弹出，不显示错误信息
- **THEN** 菜单项（Profile、Create、Log out）正常工作
