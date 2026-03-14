'use client'
import MDEditor from '@uiw/react-md-editor'
import { useTheme } from 'next-themes'

export function PostContent({ content }: { content: string }) {
  const { theme } = useTheme()
  return (
    <div className="mt-12" data-color-mode={theme === 'dark' ? 'dark' : 'light'}>
       <MDEditor.Markdown source={content} style={{ background: 'transparent' }} />
    </div>
  )
}
