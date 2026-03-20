'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updatePost, getPostById } from '@/app/profile/actions'
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
import { Loader2, Save, Send, ArrowLeft } from 'lucide-react'
import { useTheme } from 'next-themes'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Dynamic import for MDEditor
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

interface EditPostPageProps {
  postId: string
}

export default function EditPostPage({ postId }: EditPostPageProps) {
  const router = useRouter()
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [autoSaving, setAutoSaving] = useState(false)
  const [lastSavedContent, setLastSavedContent] = useState('')
  const [content, setContent] = useState('')
  const [formData, setFormData] = useState<{
    title: string
    summary: string
    category: string
    series_id: string
  }>({
    title: '',
    summary: '',
    category: 'novel',
    series_id: 'none',
  })
  const [originalPost, setOriginalPost] = useState<any>(null)

  // Category label mapping
  const categoryLabels: Record<string, string> = {
    novel: '小说',
    essay: '散文',
    poetry: '诗歌',
  }

  // Load post data
  useEffect(() => {
    const loadPost = async () => {
      const result = await getPostById(postId)
      if (result?.error) {
        toast.error('加载文章失败', { description: result.error })
        router.push('/profile')
        return
      }
      
      const post = result.data
      if (post) {
        setOriginalPost(post)
        setFormData({
          title: post.title,
          summary: post.summary,
          category: post.category,
          series_id: post.series_id || 'none',
        })
        setContent(post.content)
        setLastSavedContent(post.content)
      }
    }
    
    loadPost()
  }, [postId, router])

  // Auto-save to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      if (originalPost) {
        localStorage.setItem(`edit_post_${postId}`, JSON.stringify({ formData, content }))
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [formData, content, originalPost, postId])

  // Auto-save draft to server every 60 seconds
  useEffect(() => {
    if (!originalPost) return
    
    const interval = setInterval(async () => {
      const hasChanges = content !== lastSavedContent
      const hasContent = formData.title || content
      
      if (hasChanges && hasContent && !autoSaving) {
        setAutoSaving(true)
        try {
          const result = await updatePost(postId, {
            title: formData.title,
            category: formData.category,
            cover_url: undefined,
            series_id: formData.series_id === 'none' ? undefined : formData.series_id,
            summary: formData.summary,
            content,
          })
          
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
  }, [content, formData, lastSavedContent, autoSaving, originalPost, postId])

  const handleSubmit = async (status: 'draft' | 'pending') => {
    if (!formData.title || !content) {
      toast.error('标题和正文不能为空')
      return
    }

    setLoading(true)
    const result = await updatePost(postId, {
      title: formData.title,
      category: formData.category,
      cover_url: undefined,
      series_id: formData.series_id === 'none' ? undefined : formData.series_id,
      summary: formData.summary,
      content,
    })

    if (result?.error) {
      toast.error('操作失败', { description: result.error })
    } else {
      toast.success(status === 'draft' ? '草稿已保存' : '文章已更新')
      localStorage.removeItem(`edit_post_${postId}`)
      router.push('/profile')
    }
    setLoading(false)
  }

  if (!originalPost) {
    return (
      <div className="container max-w-4xl py-8 min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-8 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/profile">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">编辑文章</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleSubmit('draft')} disabled={loading || autoSaving}>
              {(loading || autoSaving) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {autoSaving ? '保存中...' : '保存草稿'}
            </Button>
            <span className="text-xs text-muted-foreground">草稿已保存，您可以稍后继续编辑</span>
          </div>
          <Button onClick={() => handleSubmit('pending')} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            更新文章
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

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="category">文章分类</Label>
            <Select value={formData.category} onValueChange={(value) => value && setFormData({ ...formData, category: value })}>
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
            <Select value={formData.series_id} onValueChange={(value) => value && setFormData({ ...formData, series_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="选择系列" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无系列</SelectItem>
                {/* TODO: Add series list if needed */}
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

      <div className="mt-8 p-4 bg-muted/30 rounded-lg border">
        <h3 className="text-sm font-semibold mb-2">文章信息</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">首次发布时间：</span>
            {new Date(originalPost.created_at).toLocaleString('zh-CN')}
          </div>
          <div>
            <span className="text-muted-foreground">最后修改时间：</span>
            {new Date(originalPost.updated_at).toLocaleString('zh-CN')}
          </div>
          <div>
            <span className="text-muted-foreground">当前状态：</span>
            {originalPost.status === 'draft' ? '草稿' :
             originalPost.status === 'pending' ? '审核中' :
             originalPost.status === 'published' ? '已发布' : '已拒绝'}
          </div>
        </div>
      </div>
    </div>
  )
}
