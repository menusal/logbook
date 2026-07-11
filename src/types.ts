export interface Day {
  id: string
  title: string
  description: string
  lat?: number
  lng?: number
  createdAt: number
  updatedAt: number
}

export interface Trip {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  days: Day[]
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}
