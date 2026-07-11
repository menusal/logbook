import { useRef, useState, type ReactNode } from 'react'

interface SwipeableItemProps {
  children: ReactNode
  onDelete: () => void
}

export default function SwipeableItem({ children, onDelete }: SwipeableItemProps) {
  const [translateX, setTranslateX] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const startX = useRef(0)
  const currentX = useRef(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    currentX.current = e.touches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    currentX.current = e.touches[0].clientX
    const delta = currentX.current - startX.current
    if (delta < 0) {
      setTranslateX(Math.max(delta, -120))
    }
  }

  const handleTouchEnd = () => {
    const delta = currentX.current - startX.current
    if (delta < -80) {
      setTranslateX(-120)
      setRevealed(true)
    } else {
      setTranslateX(0)
      setRevealed(false)
    }
  }

  const handleDelete = () => {
    setTranslateX(0)
    setRevealed(false)
    onDelete()
  }

  return (
    <div className="relative overflow-hidden rounded-[10px]">
      <div
        style={{ transform: `translateX(${translateX}px)` }}
        className="transition-transform duration-200 ease-out"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>
      {revealed && (
        <button
          onClick={handleDelete}
          className="absolute right-0 top-0 flex h-full w-[120px] items-center justify-center bg-ios-red text-[15px] font-semibold text-white"
        >
          Eliminar
        </button>
      )}
    </div>
  )
}
