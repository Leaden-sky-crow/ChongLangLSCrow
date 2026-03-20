import EditPostPage from './edit-post-page'

export default async function PostEditPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params
  
  return <EditPostPage postId={id} />
}
