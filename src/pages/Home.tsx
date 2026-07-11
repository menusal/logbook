import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrips } from '../hooks/useTrips'
import { useDirty } from '../components/Layout'
import SwipeableItem from '../components/SwipeableItem'
import ConfirmDialog from '../components/ConfirmDialog'
import type { Trip } from '../types'
import { generateId } from '../types'

export default function Home() {
  const { trips, setTrips } = useTrips()
  const [newTitle, setNewTitle] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null)
  const { setDirty } = useDirty()
  const navigate = useNavigate()

  const handleCreate = () => {
    const title = newTitle.trim()
    if (!title) return
    const now = Date.now()
    const trip: Trip = {
      id: generateId(),
      title,
      createdAt: now,
      updatedAt: now,
      days: [],
    }
    setTrips((prev) => [trip, ...prev])
    setNewTitle('')
    navigate(`/trip/${trip.id}`)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    setTrips((prev) => prev.filter((t) => t.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  const handleEdit = (trip: Trip) => {
    setDirty(true)
    navigate(`/trip/${trip.id}`)
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nuevo viaje..."
            className="min-h-0 flex-1 rounded-xl border border-slate-300 px-4 py-3 text-base outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button
            onClick={handleCreate}
            disabled={!newTitle.trim()}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition-all active:bg-blue-700 disabled:opacity-40"
          >
            Crear
          </button>
        </div>
      </div>

      {trips.length === 0 && (
        <div className="mt-16 text-center text-sm text-slate-400">
          No hay viajes aún. Crea uno arriba.
        </div>
      )}

      <ul className="flex flex-col gap-3">
        {trips.map((trip) => (
          <li key={trip.id}>
            <SwipeableItem onDelete={() => setDeleteTarget(trip)}>
              <button
                onClick={() => handleEdit(trip)}
                className="flex w-full items-center justify-between rounded-xl bg-white px-4 py-4 text-left shadow-sm ring-1 ring-slate-200 active:bg-slate-50"
              >
                <span className="font-medium text-slate-900">{trip.title}</span>
                <span className="shrink-0 text-xs text-slate-400">
                  {trip.days.length} {trip.days.length === 1 ? 'día' : 'días'}
                </span>
              </button>
            </SwipeableItem>
          </li>
        ))}
      </ul>

      {deleteTarget && (
        <ConfirmDialog
          title="Eliminar viaje"
          message={`¿Estás seguro de eliminar "${deleteTarget.title}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}
