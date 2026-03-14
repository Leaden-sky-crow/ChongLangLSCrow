import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Heart, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export interface Post {
  id: string
  title: string
  summary: string
  cover_url?: string
  category: string
  created_at: string
  view_count: number
  status: string
  is_pinned: boolean
  is_featured: boolean
  author: {
    nickname: string
    avatar_url: string
  }
  likes_count: number
  comments_count: number
}

export function PostCard({ post }: { post: Post }) {
  const formattedDate = format(new Date(post.created_at), 'PPP', { locale: zhCN })

  return (
    <Link href={`/posts/${post.id}`} className="group block">
      <Card className="h-full overflow-hidden transition-all hover:shadow-lg dark:hover:shadow-white/5 relative">
        {(post.is_pinned || post.is_featured) && (
          <div className="absolute right-2 top-2 z-10">
            {post.is_pinned && <Badge variant="secondary" className="mr-2">置顶</Badge>}
            {post.is_featured && <Badge variant="destructive">精选</Badge>}
          </div>
        )}
        
        {post.cover_url && (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={post.cover_url}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
              priority={post.is_pinned || post.is_featured}
            />
          </div>
        )}
        
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline">{post.category}</Badge>
            <div className="flex items-center text-xs text-muted-foreground">
              <Calendar className="mr-1 h-3 w-3" />
              {formattedDate}
            </div>
          </div>
          <h3 className="text-xl font-bold leading-tight group-hover:text-primary transition-colors">
            {post.title}
          </h3>
        </CardHeader>
        
        <CardContent className="pb-4">
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {post.summary}
          </p>
        </CardContent>
        
        <CardFooter className="flex items-center justify-between border-t bg-muted/20 p-4">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={post.author?.avatar_url} />
              <AvatarFallback>{post.author?.nickname?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{post.author?.nickname || 'Unknown'}</span>
          </div>
          <div className="flex items-center space-x-4 text-muted-foreground text-sm">
            <div className="flex items-center">
              <Heart className="mr-1 h-4 w-4" />
              {post.likes_count}
            </div>
            <div className="flex items-center">
              <MessageCircle className="mr-1 h-4 w-4" />
              {post.comments_count}
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
