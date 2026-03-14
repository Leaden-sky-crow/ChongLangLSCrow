'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { toggleUserBan, toggleUserRole } from '@/app/admin/actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  nickname: string
  avatar_url: string
  role: string
  is_banned: boolean
  created_at: string
  postCount: number
  commentCount: number
  email: string
}

export function UsersManagement({ users }: { users: User[] }) {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const filteredUsers = users.filter(user => 
    user.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleBan = async (userId: string, currentBanStatus: boolean) => {
    if (!confirm(`确定要${currentBanStatus ? '解封' : '封禁'}该用户吗？`)) return
    
    const result = await toggleUserBan(userId, !currentBanStatus)
    if (result?.error) {
      toast.error('操作失败', { description: result.error })
    } else {
      toast.success(currentBanStatus ? '用户已解封' : '用户已封禁')
      router.refresh()
    }
  }

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (!confirm(`确定要将该用户${newRole === 'admin' ? '设为管理员' : '降为普通用户'}吗？`)) return

    const result = await toggleUserRole(userId, newRole === 'admin')
    if (result?.error) {
      toast.error('操作失败', { description: result.error })
    } else {
      toast.success('权限已更新')
      router.refresh()
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Input 
          placeholder="搜索昵称..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-[300px]"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>用户</TableHead>
              <TableHead>角色</TableHead>
              <TableHead>投稿/评论</TableHead>
              <TableHead>注册时间</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback>{user.nickname?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.nickname}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                    {user.role === 'admin' ? '管理员' : '用户'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <span className="font-bold">{user.postCount}</span> 篇投稿 / <span className="font-bold">{user.commentCount}</span> 条评论
                  </div>
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={user.is_banned ? 'destructive' : 'outline'}>
                    {user.is_banned ? '已封禁' : '正常'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleToggleRole(user.id, user.role)}
                  >
                    {user.role === 'admin' ? '降权' : '提权'}
                  </Button>
                  <Button 
                    variant={user.is_banned ? 'secondary' : 'destructive'} 
                    size="sm"
                    onClick={() => handleToggleBan(user.id, user.is_banned)}
                  >
                    {user.is_banned ? '解封' : '封禁'}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
