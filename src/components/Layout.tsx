import { createContext, useContext, useState, useRef, useEffect, useCallback, type ReactNode, type MutableRefObject } from 'react'
import { useNavigate, useLocation, useBlocker } from 'react-router-dom'
import ConfirmDialog from './ConfirmDialog'

interface DirtyContextType {
  isDirty: boolean
  setDirty: (d: boolean) => void
  dirtyRef: MutableRefObject<boolean>
}

const DirtyContext = createContext<DirtyContextType>({
  isDirty: false,
  setDirty: () => {},
  dirtyRef: { current: false } as MutableRefObject<boolean>,
})

export function useDirty() {
  return useContext(DirtyContext)
}

export function DirtyProvider({ children }: { children: ReactNode }) {
  const [isDirty, setIsDirty] = useState(false)
  const dirtyRef = useRef(false)

  const setDirty = useCallback((d: boolean) => {
    dirtyRef.current = d
    setIsDirty(d)
  }, [])

  return (
    <DirtyContext.Provider value={{ isDirty, setDirty, dirtyRef }}>
      {children}
    </DirtyContext.Provider>
  )
}

interface LayoutProps {
  children: ReactNode
  title?: string
  showBack?: boolean
}

function useThemeColor() {
  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]')
    if (!meta) return

    const update = (e: MediaQueryListEvent | MediaQueryList) => {
      meta.setAttribute('content', e.matches ? '#000000' : '#F2F2F7')
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    update(mq)
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])
}

export default function Layout({ children, title, showBack }: LayoutProps) {
  useThemeColor()
  const navigate = useNavigate()
  const location = useLocation()
  const { isDirty, setDirty, dirtyRef } = useDirty()
  const [blockerOpen, setBlockerOpen] = useState(false)
  const pendingNav = useRef<(() => void) | null>(null)

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirtyRef.current && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (blocker.state === 'blocked') {
      setBlockerOpen(true)
    }
  }, [blocker.state])

  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const defaultBack = location.pathname !== '/'

  const handleBack = () => {
    if (isDirty) {
      pendingNav.current = () => navigate(-1)
      setBlockerOpen(true)
    } else {
      navigate(-1)
    }
  }

  const handleConfirmLeave = () => {
    setDirty(false)
    setBlockerOpen(false)
    if (blocker.state === 'blocked') {
      blocker.proceed()
    } else if (pendingNav.current) {
      pendingNav.current()
      pendingNav.current = null
    }
  }

  const handleCancelLeave = () => {
    setBlockerOpen(false)
    if (blocker.state === 'blocked') {
      blocker.reset()
    }
    pendingNav.current = null
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-[#F2F2F7] dark:bg-black" style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}>
      <header className="sticky top-0 z-30 flex items-end gap-2 border-b border-[#C6C6C8]/50 bg-white/80 px-4 pb-3 pt-12 backdrop-blur-xl dark:border-[#38383A]/50 dark:bg-[#1C1C1E]/80">
        {(showBack ?? defaultBack) && (
          <button
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center text-ios-blue active:opacity-60"
            aria-label="Volver"
          >
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-2xl font-bold text-[#1C1C1E] dark:text-white">{title ?? 'Bitácora'}</h1>
      </header>

      <main className="flex-1 px-4 pt-6">{children}</main>

      {blockerOpen && (
        <ConfirmDialog
          title="Cambios sin guardar"
          message="Tienes cambios sin guardar. ¿Salir sin guardar?"
          confirmLabel="Salir"
          cancelLabel="Seguir editando"
          danger
          onConfirm={handleConfirmLeave}
          onCancel={handleCancelLeave}
        />
      )}
    </div>
  )
}
