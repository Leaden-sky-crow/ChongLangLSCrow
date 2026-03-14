# 修复 UserNav DropdownMenuLabel 错误 Spec

## Why
用户点击个人头像时仍然出现 `Base UI: MenuGroupRootContext is missing` 错误。原因是 `DropdownMenuLabel` 组件在 Base UI 中实际上是 `Menu.GroupLabel`，它必须在 `Menu.Group` 内部使用。之前只移除了 `DropdownMenuGroup`，但没有移除 `DropdownMenuLabel`。

## What Changes
- 从导入中移除 `DropdownMenuLabel`
- 使用普通的 `div` 元素替代 `DropdownMenuLabel`
- 保持样式和功能不变

## Impact
- 受影响文件：`components/user-nav.tsx`
- 不影响其他组件或功能
- 非破坏性变更

## MODIFIED Requirements
### Requirement: UserNav 组件
修复 DropdownMenu 结构，移除 DropdownMenuLabel，使用普通 div 替代

#### Scenario: 用户点击头像
- **WHEN** 用户点击导航栏中的个人头像
- **THEN** DropdownMenu 正常弹出，不显示错误信息
- **THEN** 用户信息（昵称、邮箱）正确显示在菜单顶部
- **THEN** 所有菜单项正常工作
