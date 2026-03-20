'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createPost, getMySeries } from '@/app/create/actions'
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
import { toast } from 'sonner'
import { Loader2, Save, Send, Settings2, Plus, Trash2, Edit2 } from 'lucide-react'
import { useTheme } from 'next-themes'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// Dynamic import for MDEditor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[500px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
)

export default function CreatePage() {
  const router = useRouter()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSavedContent, setLastSavedContent] = useState('')
  const [content, setContent] = useState('**开始你的创作...**')
  const [seriesList, setSeriesList] = useState<{ id: string; name: string }[]>([])
  const [seriesDialogOpen, setSeriesDialogOpen] = useState(false)
  const [newSeriesName, setNewSeriesName] = useState('')
  const [editingSeriesId, setEditingSeriesId] = useState<string | null>(null)
  const [editingSeriesName, setEditingSeriesName] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    category: 'novel' as string,
    series_id: 'none' as string,
  })

  // Category label mapping
  const categoryLabels: Record<string, string> = {
    novel: '小说',
    essay: '散文',
    poetry: '诗歌',
  }

  // Fetch series
  useEffect(() => {
    getMySeries().then(setSeriesList)
  }, [])

  // Series management functions
  const handleCreateSeries = async () => {
    if (!newSeriesName.trim()) {
      toast.error('系列名称不能为空')
      return
    }
    // TODO: Implement createSeries server action
    toast.success(`创建系列 "${newSeriesName}" 成功`)
    setNewSeriesName('')
    setSeriesDialogOpen(false)
    // Refresh series list
    const updated = await getMySeries()
    setSeriesList(updated)
  }

  const handleDeleteSeries = async (seriesId: string, seriesName: string) => {
    if (!confirm(`确定要删除系列 "${seriesName}" 吗？`)) return
    // TODO: Implement deleteSeries server action
    toast.success(`删除系列 "${seriesName}" 成功`)
    setSeriesList(seriesList.filter(s => s.id !== seriesId))
    if (formData.series_id === seriesId) {
      setFormData({ ...formData, series_id: 'none' })
    }
  }

  const handleEditSeries = (series: { id: string; name: string }) => {
    setEditingSeriesId(series.id)
    setEditingSeriesName(series.name)
  }

  const handleSaveEdit = async () => {
    if (!editingSeriesName.trim()) {
      toast.error('系列名称不能为空')
      return
    }
    // TODO: Implement updateSeries server action
    toast.success(`更新系列成功`)
    setSeriesList(seriesList.map(s => 
      s.id === editingSeriesId ? { ...s, name: editingSeriesName } : s
    ))
    setEditingSeriesId(null)
    setEditingSeriesName('')
  }

  // Auto-load draft from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('draft_post')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setFormData(parsed.formData)
        setContent(parsed.content)
        setLastSavedContent(parsed.content)
        toast.info('已恢复上次未保存的草稿')
      } catch (e) {
        console.error('Failed to restore draft', e)
      }
    }
  }, [])

  // Auto-save to localStorage (keep for backup)
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('draft_post', JSON.stringify({ formData, content }))
    }, 1000)
    return () => clearTimeout(timer)
  }, [formData, content])

  // Auto-save draft to server every 60 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const hasChanges = content !== lastSavedContent
      const hasTitleAndContent = formData.title && content
      
      if (hasChanges && hasTitleAndContent && !autoSaving) {
        setAutoSaving(true)
        try {
          const data = new FormData()
          data.append('title', formData.title)
          data.append('summary', formData.summary)
          data.append('category', formData.category)
          data.append('series_id', formData.series_id)
          data.append('content', content)
          data.append('status', 'draft')

          const result = await createPost(data)
          
          if (result?.success) {
            toast.success('草稿已自动保存')
            setLastSavedContent(content)
          } else {
            console.error('自动保存失败:', result?.error)
          }
        } catch (error) {
          console.error('自动保存异常:', error)
        } finally {
          setAutoSaving(false)
        }
      }
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [content, formData, lastSavedContent, autoSaving])

  const handleSubmit = async (status: 'draft' | 'pending') => {
    if (!formData.title || !content) {
      toast.error('标题和正文不能为空')
      return
    }

    setLoading(true)
    const data = new FormData()
    data.append('title', formData.title)
    data.append('summary', formData.summary)
    data.append('category', formData.category)
    data.append('series_id', formData.series_id)
    data.append('content', content)
    data.append('status', status)

    const result = await createPost(data)

    if (result?.error) {
      toast.error('操作失败', { description: result.error })
    } else {
      toast.success(status === 'draft' ? '草稿已保存' : '投稿已提交，请等待审核')
      localStorage.removeItem('draft_post')
      router.push('/profile')
    }
    setLoading(false)
  }

  return (
    <div className="container max-w-4xl py-8 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">开始创作</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={loading || autoSaving}>
              {(loading || autoSaving) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {autoSaving ? '保存中...' : '保存草稿'}
            </Button>
            <span className="text-xs text-muted-foreground">需要有正文和题目才能保存，60 秒自动保存</span>
          </div>
          <Button onClick={() => handleSubmit('pending')} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            发布投稿
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="title">文章标题</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="text-lg font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="grid gap-2">
            <Label htmlFor="category">分类</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => value && setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择分类">
                  {formData.category ? categoryLabels[formData.category] : '选择分类'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="novel">小说</SelectItem>
                <SelectItem value="essay">散文</SelectItem>
                <SelectItem value="poetry">诗歌</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="series">系列 (可选)</Label>
              <Dialog open={seriesDialogOpen} onOpenChange={setSeriesDialogOpen}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6"
                  onClick={() => setSeriesDialogOpen(true)}
                >
                  <Settings2 className="h-3 w-3" />
                </Button>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>管理系列</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Create new series */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="新建系列名称"
                        value={newSeriesName}
                        onChange={(e) => setNewSeriesName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCreateSeries()}
                      />
                      <Button onClick={handleCreateSeries} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Series list */}
                    {seriesList.length > 0 ? (
                      <div className="space-y-2">
                        {seriesList.map((series) => (
                          <div key={series.id} className="flex items-center justify-between p-2 border rounded-md">
                            {editingSeriesId === series.id ? (
                              <div className="flex gap-2 flex-1">
                                <Input
                                  value={editingSeriesName}
                                  onChange={(e) => setEditingSeriesName(e.target.value)}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                                />
                                <Button onClick={handleSaveEdit} size="sm" variant="outline">
                                  保存
                                </Button>
                                <Button onClick={() => setEditingSeriesId(null)} size="sm" variant="ghost">
                                  取消
                                </Button>
                              </div>
                            ) : (
                              <>
                                <span className="text-sm font-medium">{series.name}</span>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleEditSeries(series)}
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleDeleteSeries(series.id, series.name)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        暂无系列，创建一个吧！
                      </p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <Select
              value={formData.series_id}
              onValueChange={(value) => value && setFormData({ ...formData, series_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择系列">
                  {formData.series_id && formData.series_id !== 'none' 
                    ? seriesList.find(s => s.id === formData.series_id)?.name || '选择系列'
                    : '无'
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无</SelectItem>
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
          <Label htmlFor="summary">摘要</Label>
          <Textarea
            id="summary"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            placeholder="简要描述文章内容，将显示在文章卡片上..."
            className="h-20"
          />
        </div>

        <div className="grid gap-2" data-color-mode={theme === 'dark' ? 'dark' : 'light'}>
          <Label>正文内容</Label>
          <MDEditor
            value={content}
            onChange={(val) => setContent(val || '')}
            height={500}
            preview="live"
          />
          <div className="mt-2 p-3 bg-muted/50 rounded-md border border-muted-foreground/20">
            <p className="text-sm text-muted-foreground font-medium">
              💡 提示：支持 Markdown 格式。图片请使用外部图床链接（推荐 <a href="https://s.ee/" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">s.ee</a>）。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
