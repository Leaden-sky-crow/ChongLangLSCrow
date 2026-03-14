'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error('登录失败', {
        description: error.message === 'Invalid login credentials' ? '邮箱或密码错误' : error.message,
      })
    } else {
      toast.success('登录成功')
      router.refresh()
      // Use replace to avoid adding login page to history and ensure navigation happens
      // Also, router.refresh() might not update the server component cache immediately for the new route
      // so we use a small delay or just rely on router.push which should trigger a server roundtrip if needed
      // But router.refresh() is crucial for updating the Navbar state.
      router.replace('/')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">登录</CardTitle>
          <CardDescription>
            输入您的邮箱和密码以登录 ChongLangLSCrow
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              登录
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              还没有账号？{' '}
              <Link href="/register" className="underline hover:text-primary">
                注册
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
