import type { Trip } from '../types'

export function formatTrip(trip: Trip): string {
  const parts: string[] = [`=== ${trip.title} ===`, '']

  trip.days.forEach((day, i) => {
    parts.push(`Día ${i + 1} — ${day.title}`)
    if (day.date) parts.push(`📅 ${day.date}`)
    if (day.lat != null && day.lng != null) {
      parts.push(`📍 ${day.lat.toFixed(6)}, ${day.lng.toFixed(6)}`)
    }
    parts.push('')
    parts.push(day.description || '(sin descripción)')
    parts.push('')
    parts.push('---')
    parts.push('')
  })

  if (trip.days.length === 0) {
    parts.push('(sin días registrados)')
    parts.push('')
  }

  return parts.join('\n')
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  }
}
