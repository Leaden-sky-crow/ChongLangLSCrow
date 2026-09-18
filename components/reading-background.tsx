'use client'

import * as React from 'react'
import { Paintbrush, Upload } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'

const MODES = [
  { id: 'white', label: '纯白' },
  { id: 'black', label: '纯黑' },
  { id: 'kraft', label: '牛皮纸' },
  { id: 'image', label: '图片' },
]

const DEFAULT_MODE = 'white'
const DEFAULT_OPACITY = 60

export function ReadingBackground() {
  const [mounted, setMounted] = React.useState(false)
  const [mode, setMode] = React.useState(DEFAULT_MODE)
  const [image, setImage] = React.useState('')
  const [opacity, setOpacity] = React.useState(DEFAULT_OPACITY)
  const fileRef = React.useRef<HTMLInputElement>(null)

  const apply = React.useCallback((m: string, img: string, op: number) => {
    const root = document.documentElement
    root.dataset.readingBg = m
    if (m === 'image') {
      root.style.setProperty('--reading-bg-image', img ? `url("${img}")` : 'none')
      root.style.setProperty('--reading-bg-opacity', String(op / 100))
    } else {
      root.style.removeProperty('--reading-bg-image')
      root.style.removeProperty('--reading-bg-opacity')
    }
    localStorage.setItem('readingBg', m)
    localStorage.setItem('readingBgImage', img)
    localStorage.setItem('readingBgOpacity', String(op))
  }, [])

  React.useEffect(() => {
    const m = localStorage.getItem('readingBg') || DEFAULT_MODE
    const img = localStorage.getItem('readingBgImage') || ''
    const op = Number(localStorage.getItem('readingBgOpacity') || DEFAULT_OPACITY)
    setMode(m)
    setImage(img)
    setOpacity(op)
    apply(m, img, op)
    setMounted(true)
  }, [apply])

  const selectMode = (m: string) => {
    setMode(m)
    apply(m, image, opacity)
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 4 * 1024 * 1024) {
      alert('图片过大，请选择 4MB 以内的图片')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setImage(dataUrl)
      apply('image', dataUrl, opacity)
      setMode('image')
    }
    reader.readAsDataURL(file)
  }

  const handleUrl = (url: string) => {
    setImage(url)
    apply('image', url, opacity)
    setMode('image')
  }

  const changeOpacity = (op: number) => {
    setOpacity(op)
    apply(mode, image, op)
  }

  if (!mounted) {
    return (
      <span
        className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'shrink-0' })}
        aria-hidden="true"
      >
        <Paintbrush className="h-5 w-5" />
      </span>
    )
  }

  return (
    <Popover>
      <PopoverTrigger
        className={buttonVariants({ variant: 'ghost', size: 'icon', className: 'shrink-0' })}
        title="阅读背景"
        aria-label="阅读背景设置"
      >
        <Paintbrush className="h-5 w-5" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <PopoverTitle>阅读背景</PopoverTitle>
        <div className="grid grid-cols-4 gap-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => selectMode(m.id)}
              className={`rounded-md border px-2 py-1.5 text-xs transition-colors ${
                mode === m.id
                  ? 'border-primary bg-primary/10 font-medium text-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        {mode === 'image' && (
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="mr-1 h-4 w-4" />
              上传图片
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
            <Input
              placeholder="或粘贴图片 URL"
              value={image.startsWith('data:') ? '' : image}
              onChange={(e) => handleUrl(e.target.value)}
            />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="shrink-0">透明度</span>
              <input
                type="range"
                min={0}
                max={100}
                value={opacity}
                onChange={(e) => changeOpacity(Number(e.target.value))}
                className="min-w-0 flex-1 accent-primary"
              />
              <span className="w-9 shrink-0 text-right">{opacity}%</span>
            </label>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
