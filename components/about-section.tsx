'use client'

import MDEditor from '@uiw/react-md-editor'
import { useTheme } from 'next-themes'

export function AboutSection({ content }: { content: string }) {
  const { theme } = useTheme()
  
  return (
    <div className="container max-w-3xl py-8" data-color-mode={theme === 'dark' ? 'dark' : 'light'}>
      <div className="rounded-lg border bg-card p-8 shadow-sm">
        <MDEditor.Markdown source={content} style={{ background: 'transparent' }} />
      </div>
    </div>
  )
}
