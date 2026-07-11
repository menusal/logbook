import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrips } from '../hooks/useTrips'
import SwipeableItem from '../components/SwipeableItem'
import ConfirmDialog from '../components/ConfirmDialog'
import type { Trip } from '../types'
import { generateId } from '../types'

export default function Home() {
  const { trips, setTrips } = useTrips()
  const [newTitle, setNewTitle] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Trip | null>(null)
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
    navigate(`/trip/${trip.id}`)
  }

  return (
    <>
      <div className="mb-5">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Nuevo viaje..."
            className="min-h-0 flex-1 rounded-[10px] bg-white px-4 py-[13px] text-[17px] text-[#1C1C1E] outline-none transition-colors focus:ring-2 focus:ring-ios-blue/30 dark:bg-[#1C1C1E] dark:text-white dark:placeholder:text-[#8E8E93]"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <button
            onClick={handleCreate}
            disabled={!newTitle.trim()}
            className="rounded-[10px] bg-ios-blue px-5 py-[13px] text-[15px] font-semibold text-white shadow-sm transition-all active:bg-[#0062CC] disabled:opacity-40"
          >
            Crear
          </button>
        </div>
      </div>

      {trips.length === 0 && (
        <div className="mt-20 text-center text-[15px] text-[#8E8E93]">
          No hay viajes aún. Crea uno arriba.
        </div>
      )}

      <div className="overflow-hidden rounded-[10px] bg-white dark:bg-[#1C1C1E]">
        <ul className="divide-y divide-[#C6C6C8]/50 dark:divide-[#38383A]/50">
          {trips.map((trip) => (
            <li key={trip.id}>
              <SwipeableItem onDelete={() => setDeleteTarget(trip)}>
                <button
                  onClick={() => handleEdit(trip)}
                  className="flex w-full items-center px-4 py-[13px] text-left active:bg-[#F2F2F7] dark:active:bg-[#2C2C2E]"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <span className="block text-[17px] text-[#1C1C1E] dark:text-white truncate">{trip.title}</span>
                    <span className="block text-[13px] text-[#8E8E93] mt-[2px]">
                      {trip.days.length} {trip.days.length === 1 ? 'día' : 'días'}
                    </span>
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
          title={`Eliminar “${deleteTarget.title}”`}
          message="Esta acción no se puede deshacer."
          confirmLabel="Eliminar viaje"
          cancelLabel="Cancelar"
          danger
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </>
  )
}
