'use client'

import { useEffect, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'

interface ConfettiPiece {
  id: number
  x: number
  y: number
  rotation: number
  color: string
  scale: number
  velocity: { x: number; y: number }
}

interface ConfettiProps {
  isActive: boolean
  duration?: number
  pieceCount?: number
  colors?: string[]
  onComplete?: () => void
}

const DEFAULT_COLORS = [
  '#FFD700', // Gold
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#45B7D1', // Blue
  '#96CEB4', // Green
  '#FFEAA7', // Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Mint
]

export function Confetti({
  isActive,
  duration = 3000,
  pieceCount = 50,
  colors = DEFAULT_COLORS,
  onComplete,
}: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const createPieces = useCallback(() => {
    return Array.from({ length: pieceCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -10 - Math.random() * 20,
      rotation: Math.random() * 360,
      color: colors[Math.floor(Math.random() * colors.length)],
      scale: 0.5 + Math.random() * 0.5,
      velocity: {
        x: (Math.random() - 0.5) * 4,
        y: 2 + Math.random() * 3,
      },
    }))
  }, [pieceCount, colors])

  useEffect(() => {
    if (!isActive) {
      setPieces([])
      return
    }

    setPieces(createPieces())

    const timeout = setTimeout(() => {
      setPieces([])
      onComplete?.()
    }, duration)

    return () => clearTimeout(timeout)
  }, [isActive, duration, createPieces, onComplete])

  if (!mounted || !isActive || pieces.length === 0) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    >
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className="absolute animate-confetti"
          style={{
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            transform: `rotate(${piece.rotation}deg) scale(${piece.scale})`,
            animationDelay: `${piece.id * 20}ms`,
            animationDuration: `${duration}ms`,
          }}
        >
          <svg
            width="12"
            height="16"
            viewBox="0 0 12 16"
            fill={piece.color}
          >
            <rect width="12" height="16" rx="2" />
          </svg>
        </div>
      ))}
    </div>,
    document.body
  )
}

// Simplified hook for confetti
export function useConfetti() {
  const [isActive, setIsActive] = useState(false)

  const trigger = useCallback(() => {
    setIsActive(true)
  }, [])

  const stop = useCallback(() => {
    setIsActive(false)
  }, [])

  return {
    isActive,
    trigger,
    stop,
    Confetti: (props: Omit<ConfettiProps, 'isActive'>) => (
      <Confetti {...props} isActive={isActive} onComplete={stop} />
    ),
  }
}
