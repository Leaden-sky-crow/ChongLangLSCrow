import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Heart, MessageSquare, User } from 'lucide-react'

interface SeriesCardProps {
  series: {
    id: string
    name: string
    description: string
    created_at: string
    author_id: string
    author?: {
      nickname: string
      avatar_url?: string
    }
    latest_posts?: Array<{
      id: string
      title: string
    }>
    total_likes: number
    total_comments: number
  }
}

export function SeriesCard({ series }: SeriesCardProps) {
  return (
    <Link href={`/series/${series.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2 line-clamp-1">{series.name}</h3>
              <p className="text-muted-foreground text-sm line-clamp-2 min-h-[2.5rem]">
                {series.description}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {series.author && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Avatar className="h-6 w-6">
                {series.author.avatar_url && (
                  <AvatarImage src={series.author.avatar_url} alt={series.author.nickname} />
                )}
                <AvatarFallback>
                  <User className="h-3 w-3" />
                </AvatarFallback>
              </Avatar>
              <span>{series.author.nickname}</span>
            </div>
          )}
          
          {series.latest_posts && series.latest_posts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">最新文章：</p>
              <ul className="space-y-1">
                {series.latest_posts.map((post) => (
                  <li key={post.id} className="text-sm text-foreground/80 line-clamp-1">
                    • {post.title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between text-xs text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(series.created_at).toLocaleDateString('zh-CN')}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{series.total_likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{series.total_comments}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
