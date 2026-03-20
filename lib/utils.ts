import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 将分类代码转换为中文显示
 */
export function getCategoryName(category: string | null | undefined): string {
  if (!category) return '未分类'
  
  const categoryMap: Record<string, string> = {
    novel: '小说',
    essay: '散文',
    poetry: '诗歌',
  }
  
  return categoryMap[category] || category
}
