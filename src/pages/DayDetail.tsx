import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTrips } from '../hooks/useTrips'
import { useDirty } from '../components/Layout'
import type { Day } from '../types'
import { generateId } from '../types'

export default function DayDetail() {
  const { tripId, dayId } = useParams<{ tripId: string; dayId: string }>()
  const navigate = useNavigate()
  const { setDirty } = useDirty()
  const { trips, setTrips } = useTrips()
  const [locating, setLocating] = useState(false)
  const [locError, setLocError] = useState('')

  const trip = trips.find((t) => t.id === tripId)
  const isNew = dayId === 'new'

  const existingDay = !isNew && trip ? trip.days.find((d) => d.id === dayId) : null

  const [title, setTitle] = useState(existingDay?.title ?? '')
  const [description, setDescription] = useState(existingDay?.description ?? '')
  const [lat, setLat] = useState<number | undefined>(existingDay?.lat)
  const [lng, setLng] = useState<number | undefined>(existingDay?.lng)

  const initialTitle = useRef(title)
  const initialDescription = useRef(description)
  const initialLat = useRef(lat)
  const initialLng = useRef(lng)

  useEffect(() => {
    if (!existingDay) return
    setTitle(existingDay.title)
    setDescription(existingDay.description)
    setLat(existingDay.lat)
    setLng(existingDay.lng)
    initialTitle.current = existingDay.title
    initialDescription.current = existingDay.description
    initialLat.current = existingDay.lat
    initialLng.current = existingDay.lng
  }, [existingDay?.id])

  const hasChanges =
    title !== initialTitle.current ||
    description !== initialDescription.current ||
    lat !== initialLat.current ||
    lng !== initialLng.current

  useEffect(() => {
    setDirty(hasChanges)
  }, [hasChanges, setDirty])

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setLocError('Geolocalización no disponible')
      return
    }
    setLocating(true)
    setLocError('')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        setLocating(false)
      },
      (err) => {
        setLocError(err.message)
        setLocating(false)
      },
      { enableHighAccuracy: true },
    )
  }

  const handleSave = () => {
    if (!tripId) return
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return

    const now = Date.now()

    if (isNew) {
      const day: Day = {
        id: generateId(),
        title: trimmedTitle,
        description,
        lat,
        lng,
        createdAt: now,
        updatedAt: now,
      }
      setTrips((prev) =>
        prev.map((t) =>
          t.id === tripId
            ? { ...t, days: [...t.days, day], updatedAt: now }
            : t,
        ),
      )
    } else if (existingDay) {
      setTrips((prev) =>
        prev.map((t) =>
          t.id === tripId
            ? {
                ...t,
                days: t.days.map((d) =>
                  d.id === dayId
                    ? { ...d, title: trimmedTitle, description, lat, lng, updatedAt: now }
                    : d,
                ),
                updatedAt: now,
              }
            : t,
        ),
      )
    }

    setDirty(false)
    navigate(`/trip/${tripId}`)
  }

  if (!trip || (!isNew && !existingDay)) {
    return (
      <div className="mt-16 text-center text-sm text-slate-400 dark:text-slate-500">
        Día no encontrado.
      </div>
    )
  }

  return (
    <>
      <div className="mb-6">
        <button
          onClick={handleLocate}
          disabled={locating}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm active:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:active:bg-slate-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {locating ? 'Obteniendo ubicación...' : 'Obtener ubicación actual'}
        </button>
        {lat != null && lng != null && (
          <p className="mt-2 text-center text-xs text-slate-500 dark:text-slate-400">
            📍 {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        )}
        {locError && (
          <p className="mt-2 text-center text-xs text-red-500">{locError}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Título
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del día / etapa"
          className="min-h-0 w-full rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>

      <div className="mb-6">
        <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Descripción
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="¿Qué pasó hoy?"
          rows={8}
          className="min-h-0 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!title.trim()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-base font-medium text-white shadow-sm transition-all active:bg-blue-700 disabled:opacity-40"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        {isNew ? 'Crear día' : 'Guardar cambios'}
      </button>
    </>
  )
}
