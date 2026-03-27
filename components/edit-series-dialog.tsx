'use client'

import { useState } from 'react'
import { updateSeries } from '@/app/series/actions'
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
import { Loader2, Edit2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface EditSeriesDialogProps {
  seriesId: string
  seriesName: string
  seriesDescription?: string
}

export function EditSeriesDialog({ 
  seriesId, 
  seriesName, 
  seriesDescription = '' 
}: EditSeriesDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(seriesName)
  const [description, setDescription] = useState(seriesDescription)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || name.trim().length === 0) {
      toast.error('更新失败', { description: '系列名称不能为空' })
      return
    }

    setLoading(true)
    const formData = new FormData()
    formData.append('name', name)
    formData.append('description', description)

    const result = await updateSeries(seriesId, formData)
    if (result?.error) {
      toast.error('更新失败', { description: result.error })
    } else {
      toast.success('系列更新成功')
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button variant="outline" size="icon" title="编辑系列">
          <Edit2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>编辑系列</DialogTitle>
          <DialogDescription>
            修改系列信息，简介可以为空。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">系列名称</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="系列名称"
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="submit" disabled={loading || !name}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
