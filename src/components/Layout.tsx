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
      meta.setAttribute('content', e.matches ? '#0f172a' : '#f8fafc')
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
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col bg-slate-50 dark:bg-slate-900" style={{ paddingTop: 'var(--safe-top)', paddingBottom: 'var(--safe-bottom)' }}>
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-slate-700 dark:bg-slate-800/90">
        {(showBack ?? defaultBack) && (
          <button
            onClick={handleBack}
            className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 active:bg-slate-100 dark:text-slate-300 dark:active:bg-slate-700"
            aria-label="Volver"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title ?? 'Bitácora'}</h1>
      </header>

      <main className="flex-1 px-4 py-5">{children}</main>

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
