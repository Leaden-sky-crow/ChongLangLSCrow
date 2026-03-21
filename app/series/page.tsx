import { getAllSeries } from '@/app/series/actions'
import { SeriesList } from '@/components/series-list'
import { Metadata } from 'next'
import config from '@/config.json'

export const metadata: Metadata = {
  title: `系列 | ${config.title}`,
}

export default async function SeriesPage() {
  const series = await getAllSeries()

  return (
    <div className="container py-20 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">系列</h1>
      <SeriesList series={series} />
    </div>
  )
}
