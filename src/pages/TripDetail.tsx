import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTrips } from '../hooks/useTrips'
import { useDirty } from '../components/Layout'
import SwipeableItem from '../components/SwipeableItem'
import ConfirmDialog from '../components/ConfirmDialog'
import { formatTrip, copyToClipboard } from '../utils/export'

export default function TripDetail() {
  const { tripId } = useParams<{ tripId: string }>()
  const navigate = useNavigate()
  const { setDirty } = useDirty()
  const { trips, setTrips } = useTrips()

  const trip = trips.find((t) => t.id === tripId)
  const [title, setTitle] = useState(trip?.title ?? '')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const initialTitle = useRef(title)

  useEffect(() => {
    if (!trip) return
    setTitle(trip.title)
    initialTitle.current = trip.title
  }, [trip?.title])

  if (!trip || !tripId) {
    return (
      <div className="mt-20 text-center text-[15px] text-[#8E8E93]">
        Viaje no encontrado.
      </div>
    )
  }

  const hasChanges = title !== initialTitle.current
  useEffect(() => {
    setDirty(hasChanges)
  }, [hasChanges, setDirty])

  const handleSaveTitle = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId ? { ...t, title: trimmed, updatedAt: Date.now() } : t,
      ),
    )
    initialTitle.current = trimmed
    setDirty(false)
  }

  const handleDeleteDay = (dayId: string) => {
    setDeleteTarget(dayId)
  }

  const confirmDeleteDay = () => {
    if (!deleteTarget) return
    setTrips((prev) =>
      prev.map((t) =>
        t.id === tripId
          ? {
              ...t,
              days: t.days.filter((d) => d.id !== deleteTarget),
              updatedAt: Date.now(),
            }
          : t,
      ),
    )
    setDeleteTarget(null)
  }

  const handleNewDay = () => {
    navigate(`/trip/${tripId}/day/new`)
  }

  const handleExport = async () => {
    const updated = trips.find((t) => t.id === tripId)
    if (!updated) return
    const text = formatTrip(updated)
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-[10px] bg-white dark:bg-[#1C1C1E]">
        <div className="flex items-center gap-2 px-4 py-[13px]">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-h-0 flex-1 bg-transparent text-[17px] font-semibold text-[#1C1C1E] outline-none dark:text-white"
          />
          <button
            onClick={handleSaveTitle}
            disabled={!title.trim() || !hasChanges}
            className="rounded-[8px] bg-ios-blue px-4 py-[7px] text-[15px] font-semibold text-white active:bg-[#0062CC] disabled:opacity-40"
          >
            Guardar
          </button>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={handleNewDay}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-ios-blue py-[13px] text-[15px] font-semibold text-white shadow-sm active:bg-[#0062CC]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo día
        </button>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-1.5 rounded-[10px] bg-white px-5 py-[13px] text-[15px] font-semibold text-ios-blue shadow-sm active:bg-[#F2F2F7] dark:bg-[#1C1C1E] dark:active:bg-[#2C2C2E]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {copied ? 'Copiado' : 'Exportar'}
        </button>
      </div>

      <h2 className="mt-7 mb-[7px] px-1 text-[13px] font-semibold uppercase tracking-[0.04em] text-[#8E8E93]">
        Días / Etapas
      </h2>

      {trip.days.length === 0 && (
        <div className="mt-10 text-center text-[15px] text-[#8E8E93]">
          Aún no hay días registrados.
        </div>
      )}

      <div className="overflow-hidden rounded-[10px] bg-white dark:bg-[#1C1C1E]">
        <ul className="divide-y divide-[#C6C6C8]/50 dark:divide-[#38383A]/50">
          {trip.days.map((day, i) => (
            <li key={day.id}>
              <SwipeableItem onDelete={() => handleDeleteDay(day.id)}>
                <button
                  onClick={() => navigate(`/trip/${tripId}/day/${day.id}`)}
                  className="flex w-full items-center px-4 py-[13px] text-left active:bg-[#F2F2F7] dark:active:bg-[#2C2C2E]"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="text-[13px] font-medium text-ios-blue">
                      Día {i + 1}
                    </span>
                    <p className="text-[17px] text-[#1C1C1E] dark:text-white truncate mt-[1px]">
                      {day.title || '(sin título)'}
                    </p>
                  </div>
                  <svg className="h-4 w-4 shrink-0 text-[#C6C6C8] dark:text-[#48484A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </SwipeableItem>
            </li>
          ))}
        </ul>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar día"
          message="Esta acción no se puede deshacer."
          confirmLabel="Eliminar día"
          cancelLabel="Cancelar"
          danger
          onConfirm={confirmDeleteDay}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}
