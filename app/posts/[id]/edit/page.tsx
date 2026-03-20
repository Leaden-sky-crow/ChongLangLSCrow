import EditPostPage from './edit-post-page'

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
