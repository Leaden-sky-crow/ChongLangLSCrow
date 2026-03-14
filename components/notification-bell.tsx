'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '@/app/notifications/actions'
import { toast } from 'sonner'

interface Notification {
  id: string
  title: string
  content: string
  is_read: boolean
  type: string
  link_url: string | null
  created_at: string
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadNotifications()
    }
  }, [open])

  const loadNotifications = async () => {
    setIsLoading(true)
    const result = await getUserNotifications(20)
    
    if (result.notifications) {
      setNotifications(result.notifications)
      setUnreadCount(result.unreadCount)
    } else if (result.error) {
      toast.error('加载通知失败')
    }
    
    setIsLoading(false)
  }

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markNotificationAsRead(notification.id)
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    if (notification.link_url) {
      window.open(notification.link_url, '_blank')
    }
  }

  const handleMarkAllAsRead = async () => {
    const result = await markAllNotificationsAsRead()
    
    if (result.success) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
      toast.success('已标记所有通知为已读')
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'system': return '📢'
      case 'post_status': return '📝'
      case 'comment': return '💬'
      case 'like': return '❤️'
      default: return '🔔'
    }
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="inline-flex shrink-0 items-center justify-center rounded-md bg-transparent hover:bg-accent hover:text-accent-foreground h-9 w-9 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 relative">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between p-3 border-b border-border/50">
          <span className="text-sm font-medium">通知</span>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-auto text-xs"
              onClick={handleMarkAllAsRead}
            >
              全部已读
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {isLoading && (
            <div className="text-center text-muted-foreground py-8">
              加载中...
            </div>
          )}
          
          {!isLoading && notifications.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              <Bell className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>暂无通知</p>
            </div>
          )}
          
          {!isLoading && notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              className={`p-4 cursor-pointer flex flex-col items-start gap-2 ${
                !notification.is_read ? 'bg-muted/50' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-2 w-full">
                <span className="text-lg">{getTypeIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium ${
                      !notification.is_read ? 'font-semibold' : ''
                    }`}>
                      {notification.title}
                    </p>
                    {!notification.is_read && (
                      <span className="h-2 w-2 bg-blue-500 rounded-full shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {notification.content}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatTime(notification.created_at)}
                  </p>
                </div>
              </div>
            </DropdownMenuItem>
          ))}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
