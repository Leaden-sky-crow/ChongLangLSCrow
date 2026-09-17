import { Skeleton } from '@/components/ui/skeleton'

export default function PostLoading() {
  return (
    <div className="min-h-screen pb-20">
      {/* 封面占位 */}
      <div className="relative h-[40vh] w-full overflow-hidden bg-muted/30" />

      <div className="container max-w-3xl py-8">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="mt-4 h-10 w-3/4 max-w-xl" />
        <div className="mt-6 flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="mt-12 space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  )
}
