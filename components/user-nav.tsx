'use client'

import { type User as SupabaseUser } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button, buttonVariants } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { createClient } from '@/utils/supabase/client'
import { User, PenSquare, LogOut } from 'lucide-react'

interface Profile {
  nickname: string | null
  avatar_url: string | null
}

export function UserNav({ user, profile }: { user: SupabaseUser; profile: Profile | null }) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
  }

  // Use profile data from profiles table, fallback to user_metadata
  const nickname = profile?.nickname || user.user_metadata.nickname || user.email?.split('@')[0] || '用户'
  const avatarUrl = profile?.avatar_url || user.user_metadata.avatar_url

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", className: "relative h-8 w-8 rounded-full transition-colors hover:bg-accent" })}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={avatarUrl} alt={nickname} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{nickname.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end">
        <div className="flex items-center gap-3 p-3 border-b border-border/50">
          <Avatar className="h-10 w-10">
            <AvatarImage src={avatarUrl} alt={nickname} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">{nickname.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-0.5 min-w-0">
            <p className="text-sm font-semibold leading-none truncate">{nickname}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>个人主页</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/create')} className="cursor-pointer">
          <PenSquare className="mr-2 h-4 w-4" />
          <span>创作</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
