'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { searchUsersForNotifications, sendSystemNotifications } from '@/app/admin/actions'
import { Send, Search, Users, UserCheck } from 'lucide-react'

interface User {
  id: string
  nickname: string | null
  avatar_url: string | null
  email: string | null
}

export function NotificationsManagement() {
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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch()
      } else {
        loadAllUsers()
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  const loadAllUsers = async () => {
    setIsSearching(true)
    const result = await searchUsersForNotifications('')
    if (result.users) {
      setUsers(result.users)
    } else if (result.error) {
      toast.error(result.error)
    }
    setIsSearching(false)
  }

  const handleSearch = async () => {
    setIsSearching(true)
    const result = await searchUsersForNotifications(searchQuery)
    if (result.users) {
      setUsers(result.users)
    } else if (result.error) {
      toast.error(result.error)
    }
    setIsSearching(false)
  }

  const toggleUserSelection = (userId: string) => {
    const newSelected = new Set(selectedUsers)
    if (newSelected.has(userId)) {
      newSelected.delete(userId)
    } else {
      newSelected.add(userId)
    }
    setSelectedUsers(newSelected)
    if (newSelected.size > 0) {
      setSendToAll(false)
    }
  }

  const toggleSendToAll = (checked: boolean) => {
    setSendToAll(checked)
    if (checked) {
      setSelectedUsers(new Set())
    }
  }

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error('请输入通知标题')
      return
    }
    if (!formData.content.trim()) {
      toast.error('请输入通知内容')
      return
    }

    setIsLoading(true)
    const userIds = sendToAll ? [] : Array.from(selectedUsers)
    
    const result = await sendSystemNotifications(
      userIds,
      formData.title,
      formData.content,
      formData.linkUrl || undefined
    )

    setIsLoading(false)

    if (result.success) {
      toast.success(`成功发送 ${result.count} 条通知`)
      setFormData({ title: '', content: '', linkUrl: '' })
      setSelectedUsers(new Set())
      setSendToAll(false)
    } else if (result.error) {
      toast.error(result.error)
    }
  }

  const getUserDisplayName = (user: User) => {
    return user.nickname || user.email || '未知用户'
  }

  const getUserAvatar = (user: User) => {
    return user.avatar_url || undefined
  }

  const getUserFallback = (user: User) => {
    return getUserDisplayName(user).charAt(0).toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>发送系统通知</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label>接收用户</Label>
            <div className="flex items-center space-x-2 my-2">
              <Checkbox
                id="send-to-all"
                checked={sendToAll}
                onCheckedChange={toggleSendToAll}
              />
              <label
                htmlFor="send-to-all"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                发送给所有用户
              </label>
            </div>

            {!sendToAll && (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索用户名或邮箱..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {isSearching && (
                  <p className="text-sm text-muted-foreground text-center">搜索中...</p>
                )}

                {!isSearching && users.length > 0 && (
                  <div className="border rounded-md max-h-60 overflow-y-auto">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-3 p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        <Checkbox
                          checked={selectedUsers.has(user.id)}
                          onCheckedChange={() => toggleUserSelection(user.id)}
                        />
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={getUserAvatar(user)} />
                          <AvatarFallback>{getUserFallback(user)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{getUserDisplayName(user)}</p>
                          {user.email && user.email !== getUserDisplayName(user) && (
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!isSearching && users.length === 0 && searchQuery && (
                  <p className="text-sm text-muted-foreground text-center">未找到匹配的用户</p>
                )}

                {selectedUsers.size > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <UserCheck className="h-4 w-4" />
                    <span>已选择 {selectedUsers.size} 个用户</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="title">通知标题</Label>
            <Input
              id="title"
              placeholder="请输入标题（最多 50 字符）"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.title.length}/50
            </p>
          </div>

          <div>
            <Label htmlFor="content">通知内容</Label>
            <Textarea
              id="content"
              placeholder="请输入通知内容（最多 500 字符）"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              maxLength={500}
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.content.length}/500
            </p>
          </div>

          <div>
            <Label htmlFor="linkUrl">可选链接 URL</Label>
            <Input
              id="linkUrl"
              placeholder="https://..."
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              type="url"
            />
            <p className="text-xs text-muted-foreground mt-1">
              用户点击通知后跳转的链接（可选）
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || (!sendToAll && selectedUsers.size === 0)}
            className="flex-1"
          >
            {isLoading ? (
              '发送中...'
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                发送通知
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setFormData({ title: '', content: '', linkUrl: '' })
              setSelectedUsers(new Set())
              setSendToAll(false)
              setSearchQuery('')
            }}
            disabled={isLoading}
          >
            取消
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
