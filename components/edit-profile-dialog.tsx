'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { updateProfile } from '@/app/profile/actions'
import { Loader2 } from 'lucide-react'

interface Profile {
  id: string
  nickname: string
  avatar_url: string
  bio: string
  contact_info: any
}

export function EditProfileDialog({ profile }: { profile: Profile }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nickname: profile.nickname || '',
    avatar_url: profile.avatar_url || '',
    bio: profile.bio || '',
    email: profile.contact_info?.email || '',
    phone: profile.contact_info?.phone || '',
    wechat: profile.contact_info?.wechat || '',
    qq: profile.contact_info?.qq || '',
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const contact_info = JSON.stringify({
      email: formData.email,
      phone: formData.phone,
      wechat: formData.wechat,
      qq: formData.qq,
    })

    const result = await updateProfile(profile.id, {
      nickname: formData.nickname,
      avatar_url: formData.avatar_url,
      bio: formData.bio,
      contact_info,
    })

    if (result?.error) {
      toast.error('更新失败', { description: result.error })
    } else {
      toast.success('个人资料已更新')
      setOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button 
        variant="outline"
        onClick={() => setOpen(true)}
      >
        编辑资料
      </Button>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>编辑个人资料</DialogTitle>
          <DialogDescription>
            在这里修改您的公开信息。点击保存以应用更改。
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nickname" className="text-right">
                昵称
              </Label>
              <Input
                id="nickname"
                value={formData.nickname}
                onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="avatar" className="text-right">
                头像 URL
              </Label>
              <div className="col-span-3">
                <Input
                  id="avatar"
                  value={formData.avatar_url}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder="https://s.ee/..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  推荐使用 <a href="https://s.ee/" target="_blank" rel="noopener noreferrer" className="underline">s.ee</a> 等图床
                </p>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right">
                简介
              </Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact_email" className="text-right">
                公开邮箱
              </Label>
              <Input
                id="contact_email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="col-span-3"
              />
            </div>
             {/* Add other contact fields as needed */}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              保存更改
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
