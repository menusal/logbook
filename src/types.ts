export interface Day {
  id: string
  title: string
  description: string
  date: string
  lat?: number
  lng?: number
  createdAt: number
  updatedAt: number
}

export function todayISO(): string {
  const d = new Date()
  return d.getFullYear() + '-' +
    String(d.getMonth() + 1).padStart(2, '0') + '-' +
    String(d.getDate()).padStart(2, '0')
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
