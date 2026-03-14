import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '开始创作',
}

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
