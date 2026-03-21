import { getSeriesById } from '@/app/series/actions'
import { PostList, type Post } from '@/components/post-list'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Heart, MessageSquare, User } from 'lucide-react'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import config from '@/config.json'

interface SeriesDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: SeriesDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const series = await getSeriesById(id)
  
  if (!series) {
    return {
      title: `系列不存在 | ${config.title}`,
    }
  }
  
  return {
    title: `${series.name} | ${config.title}`,
  }
}

export default async function SeriesDetailPage({ params }: SeriesDetailPageProps) {
  const { id } = await params
  const series = await getSeriesById(id)

  if (!series) {
    notFound()
  }

  return (
    <div className="container py-20 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{series.name}</h1>
        {series.description && (
          <p className="text-muted-foreground mb-4">{series.description}</p>
        )}
        
        <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
          {series.author && (
            <div className="flex items-center gap-2">
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
          
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(series.created_at).toLocaleDateString('zh-CN')}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{series.total_likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              <span>{series.total_comments}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t pt-8">
        <h2 className="text-xl font-bold mb-6">系列文章</h2>
        <PostList posts={series.posts as Post[]} />
      </div>
    </div>
  )
}
