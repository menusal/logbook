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
      <div className="mt-16 text-center text-sm text-slate-400">
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
      <div className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="min-h-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-base font-medium outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            onClick={handleSaveTitle}
            disabled={!title.trim()}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition-all active:bg-blue-700 disabled:opacity-40"
          >
            Guardar
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-3">
        <button
          onClick={handleNewDay}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white shadow-sm active:bg-blue-700"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo día
        </button>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 shadow-sm active:bg-slate-50"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          {copied ? 'Copiado' : 'Exportar'}
        </button>
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
        Días / Etapas
      </h2>

      {trip.days.length === 0 && (
        <div className="mt-8 text-center text-sm text-slate-400">
          Aún no hay días registrados.
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {trip.days.map((day, i) => (
          <li key={day.id}>
            <SwipeableItem onDelete={() => handleDeleteDay(day.id)}>
              <button
                onClick={() => navigate(`/trip/${tripId}/day/${day.id}`)}
                className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-4 text-left shadow-sm ring-1 ring-slate-200 active:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-medium text-blue-600">
                    Día {i + 1}
                  </span>
                  <p className="truncate font-medium text-slate-900">
                    {day.title || '(sin título)'}
                  </p>
                </div>
                <svg className="ml-2 h-5 w-5 shrink-0 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </SwipeableItem>
          </li>
        ))}
      </ul>

      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar día"
          message="¿Estás seguro de eliminar este día? Esta acción no se puede deshacer."
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          danger
          onConfirm={confirmDeleteDay}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}
