'use client'

import Link from 'next/link'
import { Menu, BookOpen, PenTool, Feather, Folder, User, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import config from '@/config.json'

const navLinks = [
  { href: '/posts', label: '全部', icon: BookOpen },
  { href: '/posts?category=novel', label: '小说', icon: BookOpen },
  { href: '/posts?category=essay', label: '散文', icon: PenTool },
  { href: '/posts?category=poetry', label: '诗歌', icon: Feather },
  { href: '/series', label: '系列', icon: Folder },
  { href: '/about', label: '关于我', icon: User },
]

export function MobileNav({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 md:hidden"
            aria-label="打开导航菜单"
          />
        }
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 max-w-[85vw]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <img src="/favicon.jpg" alt="Logo" className="h-6 w-6 rounded-full" />
            {config.title}
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 px-4 pb-6">
          {navLinks.map((link) => (
            <SheetClose
              key={link.href}
              render={
                <Link
                  href={link.href}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/70 transition-colors hover:bg-muted hover:text-foreground"
                />
              }
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </SheetClose>
          ))}
          {isAdmin && (
            <SheetClose
              render={
                <Link
                  href="/admin"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold text-destructive/80 transition-colors hover:bg-muted"
                />
              }
            >
              <ShieldAlert className="h-4 w-4" />
              后台管理
            </SheetClose>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
