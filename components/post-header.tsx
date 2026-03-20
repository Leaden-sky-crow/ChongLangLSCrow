import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { getCategoryName } from '@/lib/utils'

export function PostHeader({ post }: { post: any }) {
  return (
    <div className="relative w-full">
      {post.cover_url && (
        <div className="relative h-[40vh] w-full overflow-hidden">
          <img
             src={post.cover_url}
             alt={post.title}
             className="h-full w-full object-cover brightness-50 blur-[2px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        </div>
      )}
      
      <div className={`container max-w-3xl ${post.cover_url ? '-mt-24 relative z-10' : 'pt-20'}`}>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Badge>{getCategoryName(post.category)}</Badge>
            {post.series && <Badge variant="outline">{post.series.name}</Badge>}
          </div>
          
          <h1 className="text-4xl font-bold leading-tight md:text-5xl drop-shadow-sm">{post.title}</h1>
          
          <div className="flex items-center justify-between pt-4">
             <div className="flex items-center space-x-3">
               <Avatar>
                 <AvatarImage src={post.author?.avatar_url} />
                 <AvatarFallback>{post.author?.nickname?.slice(0, 2).toUpperCase()}</AvatarFallback>
               </Avatar>
               <div>
                 <p className="text-sm font-medium">{post.author?.nickname}</p>
                 <p className="text-xs text-muted-foreground">
                   {format(new Date(post.created_at), 'PPP p', { locale: zhCN })}
                 </p>
               </div>
             </div>
             <div className="text-sm text-muted-foreground">
               阅读 {post.view_count}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
