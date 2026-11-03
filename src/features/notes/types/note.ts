export type Note = {
  id: string
  title: string
  content: string
  category: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export const categories = ['Personal', 'Work', 'Ideas', 'Journal'] as const
export type Category = (typeof categories)[number]
