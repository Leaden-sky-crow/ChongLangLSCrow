import { SeriesCard } from '@/components/series-card'

interface SeriesListProps {
  series: Array<{
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
  }>
}

export function SeriesList({ series }: SeriesListProps) {
  if (!series || series.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        暂无系列
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {series.map((s) => (
        <SeriesCard key={s.id} series={s} />
      ))}
    </div>
  )
}
