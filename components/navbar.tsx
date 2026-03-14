import Link from "next/link"
import { Search, BookOpen, PenTool, Feather, User, PenSquare, Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/utils/supabase/server"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { SearchInput } from "@/components/search-input"
import { NotificationBell } from "@/components/notification-bell"

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    isAdmin = profile?.role === 'admin'
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <img src="/favicon.jpg" alt="Logo" className="h-6 w-6 rounded-full" />
            <span className="hidden font-bold sm:inline-block">
              ChongLangLSCrow
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/posts" className="flex items-center transition-colors hover:text-foreground/80 text-foreground/60">
              <BookOpen className="mr-1 h-4 w-4" />
              全部
            </Link>
            <Link href="/posts?category=novel" className="flex items-center transition-colors hover:text-foreground/80 text-foreground/60">
              <BookOpen className="mr-1 h-4 w-4" />
              小说
            </Link>
            <Link href="/posts?category=essay" className="flex items-center transition-colors hover:text-foreground/80 text-foreground/60">
              <PenTool className="mr-1 h-4 w-4" />
              散文
            </Link>
            <Link href="/posts?category=poetry" className="flex items-center transition-colors hover:text-foreground/80 text-foreground/60">
              <Feather className="mr-1 h-4 w-4" />
              诗歌
            </Link>
            <Link href="/about" className="flex items-center transition-colors hover:text-foreground/80 text-foreground/60">
              <User className="mr-1 h-4 w-4" />
              关于我
            </Link>
            {isAdmin && (
              <Link href="/admin" className="transition-colors hover:text-destructive text-destructive/80 font-bold">
                后台管理
              </Link>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <SearchInput />
          </div>
          {user && (
            <Link href="/create">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <PenSquare className="mr-2 h-4 w-4" />
                创作
              </Button>
              <Button variant="ghost" size="icon" className="sm:hidden">
                <PenSquare className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <ModeToggle />
          {user ? (
            <>
              <NotificationBell />
              <UserNav user={user} />
            </>
          ) : (
            <nav className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">登录</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">注册</Button>
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}
