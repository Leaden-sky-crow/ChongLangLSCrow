import EditPostPage from './edit-post-page'
import { getPost } from '@/lib/posts'
import { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await getPost((await params).id)
  return {
    title: `编辑文章 - ${post?.title || '文章详情'}`,
  }
}

export default async function PostEditPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  // Prevent rendering with empty id
  if (!id) {
    return (
      <div className="container max-w-4xl py-8 min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">文章 ID 无效</p>
      </div>
    )
  }
  
  return <EditPostPage postId={id} />
}
