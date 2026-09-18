'use client'

import * as React from 'react'
import { Type, Check } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const FONTS = [
  { id: 'chillhuo', label: '寒蝉活宋体', family: '"ChillHuoSong_F", serif' },
  { id: 'earlysummer', label: '初夏明朝体', family: '"Early Summer Serif VF", serif' },
  { id: 'zhuque', label: '朱雀仿宋体', family: '"Zhuque Fangsong (technical preview)", serif' },
  { id: 'wenkai', label: '霞鹭文楷', family: '"LXGW WenKai", cursive' },
  { id: 'unifont', label: 'Unifont 像素体', family: '"Unifont", monospace' },
  { id: 'huiwen', label: '汇文明朝体', family: '"Huiwen-mincho", serif' },
  { id: 'kinghwa', label: '京华老宋体', family: '"KingHwaOldSong", serif' },
  { id: 'sys-song', label: '系统宋体', family: '"SimSun", "宋体", serif' },
  { id: 'sys-hei', label: '系统黑体', family: '"SimHei", "黑体", sans-serif' },
]

const SIZES = [
  { id: 'sm', label: '小' },
  { id: 'md', label: '中' },
  { id: 'lg', label: '大' },
  { id: 'xl', label: '特大' },
]

const DEFAULT_FONT = 'chillhuo'
const DEFAULT_SIZE = 'md'

export function FontSwitcher() {
  const [mounted, setMounted] = React.useState(false)
  const [font, setFont] = React.useState(DEFAULT_FONT)
  const [size, setSize] = React.useState(DEFAULT_SIZE)

  React.useEffect(() => {
    setMounted(true)
    setFont(localStorage.getItem('font') || DEFAULT_FONT)
    setSize(localStorage.getItem('fontSize') || DEFAULT_SIZE)
  }, [])

  const changeFont = (id: string) => {
    document.documentElement.dataset.font = id
    localStorage.setItem('font', id)
    setFont(id)
  }

  const changeSize = (id: string) => {
    document.documentElement.dataset.fontSize = id
    localStorage.setItem('fontSize', id)
    setSize(id)
  }

  if (!mounted) {
    return (
      <span
        className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'shrink-0' })}
        aria-hidden="true"
      >
        <Type className="h-5 w-5" />
      </span>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'shrink-0' })}
        title="字体与字号"
        aria-label="字体与字号设置"
      >
        <Type className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuGroup>
          <DropdownMenuLabel>字体</DropdownMenuLabel>
          {FONTS.map((f) => (
            <DropdownMenuItem key={f.id} onClick={() => changeFont(f.id)}>
              <span className="flex-1" style={{ fontFamily: f.family }}>
                {f.label}
              </span>
              {font === f.id && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>字号</DropdownMenuLabel>
          {SIZES.map((s) => (
            <DropdownMenuItem key={s.id} onClick={() => changeSize(s.id)}>
              <span className="flex-1">{s.label}</span>
              {size === s.id && <Check className="h-4 w-4 text-primary" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
