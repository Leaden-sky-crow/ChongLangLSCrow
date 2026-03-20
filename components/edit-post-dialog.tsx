'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updatePost } from '@/app/profile/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import dynamic from 'next/dynamic'

const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[300px] w-full items-center justify-center border rounded-md">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
)

interface Post {
  id: string
  title: string
  category: string
  cover_url?: string
  series_id?: string
  summary: string
  content: string
  status: string
  created_at: string
}

interface EditPostDialogProps {
  post: Post
  seriesList?: { id: string; name: string }[]
}

export function EditPostDialog({ post, seriesList = [] }: EditPostDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState(post.title)
  const [category, setCategory] = useState<string>(post.category)
  const [coverUrl, setCoverUrl] = useState(post.cover_url || '')
  const [seriesId, setSeriesId] = useState<string | undefined>(post.series_id)
  const [summary, setSummary] = useState(post.summary)
  const [content, setContent] = useState(post.content)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !summary || !content) {
      toast.error('请填写必填项')
      return
    }

    setLoading(true)
    const result = await updatePost(post.id, {
      title,
      category,
      cover_url: coverUrl || undefined,
      series_id: seriesId || undefined,
      summary,
      content,
    })

    if (result?.error) {
      toast.error('更新失败', { description: result.error })
    } else {
      toast.success('文章已更新，首次发布时间保持不变')
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  const canEdit = post.status === 'draft' || post.status === 'rejected'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        disabled={!canEdit}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => setOpen(true)}
      >
        <Edit2 className="mr-2 h-4 w-4" />
        编辑
      </Button>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>编辑文章</DialogTitle>
          <DialogDescription>
            修改文章内容后需要重新提交审核。首次发布时间将保持不变。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">标题 *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="文章标题"
              maxLength={100}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">分类 *</Label>
              <Select value={category} onValueChange={(value) => value && setCategory(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novel">小说</SelectItem>
                  <SelectItem value="essay">散文</SelectItem>
                  <SelectItem value="poetry">诗歌</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="series">系列（可选）</Label>
              <Select value={seriesId} onValueChange={(value) => setSeriesId(value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="选择系列" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">无系列</SelectItem>
                  {seriesList.map((series) => (
                    <SelectItem key={series.id} value={series.id}>
                      {series.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cover">封面图片 URL（可选）</Label>
            <Input
              id="cover"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="summary">摘要 *</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="文章摘要，最多 500 字"
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content">内容 *</Label>
            <div data-color-mode="light">
              <MDEditor
                value={content}
                onChange={(val) => setContent(val || '')}
                height={400}
                preview="live"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存修改
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
