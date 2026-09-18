'use client'

import MDEditor from '@uiw/react-md-editor'
import { useTheme } from 'next-themes'

export function AboutSection({ content }: { content: string }) {
  const { theme } = useTheme()
  
  return (
    <div className="container max-w-3xl py-8" data-color-mode={theme === 'dark' ? 'dark' : 'light'}>
      <div className="reading-panel p-6 md:p-8">
        <MDEditor.Markdown source={content} style={{ background: 'transparent' }} />
      </div>
    </div>
  )
}
