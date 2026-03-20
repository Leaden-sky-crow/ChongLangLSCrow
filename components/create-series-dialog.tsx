'use client'

import { useState } from 'react'
import { createSeries } from '@/app/series/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function CreateSeriesDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || name.trim().length === 0) {
      toast.error('创建失败', { description: '系列名称不能为空' })
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)

    const result = await createSeries(formData)
    if (result?.error) {
      toast.error('创建失败', { description: result.error })
    } else {
      toast.success('系列创建成功')
      setOpen(false)
      setName('')
      setDescription('')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        新建系列
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>创建新系列</DialogTitle>
          <DialogDescription>
            将您的文章组织成系列，方便读者阅读。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">系列名称</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：科幻短篇集"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">简介 (可选)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述这个系列的内容..."
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading || !name}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              创建
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
