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
      <div className="mt-20 text-center text-[15px] text-[#8E8E93]">
        Día no encontrado.
      </div>
    )
  }

  return (
    <>
      <button
        onClick={handleLocate}
        disabled={locating}
        className="flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-white py-[13px] text-[15px] font-semibold text-ios-blue shadow-sm active:bg-[#F2F2F7] disabled:opacity-50 dark:bg-[#1C1C1E] dark:active:bg-[#2C2C2E]"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {locating ? 'Obteniendo ubicación...' : 'Obtener ubicación'}
      </button>
      {lat != null && lng != null && (
        <p className="mt-2 text-center text-[13px] text-[#8E8E93]">
          📍 {lat.toFixed(6)}, {lng.toFixed(6)}
        </p>
      )}
      {locError && (
        <p className="mt-2 text-center text-[13px] text-ios-red">{locError}</p>
      )}

      <div className="mt-5 overflow-hidden rounded-[10px] bg-white dark:bg-[#1C1C1E]">
        <div className="divide-y divide-[#C6C6C8]/50 dark:divide-[#38383A]/50">
          <div className="px-4 py-[13px]">
            <label className="block text-[13px] font-semibold uppercase tracking-[0.04em] text-[#8E8E93]">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del día / etapa"
              className="mt-1 min-h-0 w-full bg-transparent text-[17px] text-[#1C1C1E] outline-none placeholder:text-[#C6C6C8] dark:text-white dark:placeholder:text-[#48484A]"
            />
          </div>
          <div className="px-4 py-[13px]">
            <label className="block text-[13px] font-semibold uppercase tracking-[0.04em] text-[#8E8E93]">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿Qué pasó hoy?"
              rows={6}
              className="mt-1 min-h-0 w-full resize-none bg-transparent text-[17px] text-[#1C1C1E] outline-none placeholder:text-[#C6C6C8] dark:text-white dark:placeholder:text-[#48484A]"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={!title.trim()}
        className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-[10px] bg-ios-blue py-[13px] text-[17px] font-semibold text-white shadow-sm transition-all active:bg-[#0062CC] disabled:opacity-40"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        {isNew ? 'Crear día' : 'Guardar cambios'}
      </button>
    </>
  )
}
