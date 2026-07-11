import { createContext, useContext, type ReactNode } from 'react'
import { useLocalStorage } from './useLocalStorage'
import type { Trip } from '../types'

interface TripsContextType {
  trips: Trip[]
  setTrips: (next: Trip[] | ((prev: Trip[]) => Trip[])) => void
}

const TripsContext = createContext<TripsContextType | null>(null)

export function TripsProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useLocalStorage<Trip[]>('logbook_trips', [])
  return (
    <TripsContext.Provider value={{ trips, setTrips }}>
      {children}
    </TripsContext.Provider>
  )
}

export function useTrips() {
  const ctx = useContext(TripsContext)
  if (!ctx) {
    throw new Error('useTrips must be used inside TripsProvider')
  }
  return ctx
}
