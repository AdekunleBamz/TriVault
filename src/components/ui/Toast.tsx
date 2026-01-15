'use client'

import { useEffect, useState } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  type: ToastType
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

const toastStyles: Record<ToastType, { bg: string; icon: string; border: string }> = {
  success: {
    bg: 'bg-green-900/90',
    icon: '✓',
    border: 'border-green-500',
  },
  error: {
    bg: 'bg-red-900/90',
    icon: '✕',
    border: 'border-red-500',
  },
  warning: {
    bg: 'bg-yellow-900/90',
    icon: '⚠',
    border: 'border-yellow-500',
  },
  info: {
    bg: 'bg-blue-900/90',
    icon: 'ℹ',
    border: 'border-blue-500',
  },
}

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)
  const styles = toastStyles[type]

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(() => onClose(id), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, id, onClose])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => onClose(id), 300)
  }

  return (
    <div
      className={`
        ${styles.bg} ${styles.border}
        border-l-4 rounded-lg shadow-lg p-4
        transform transition-all duration-300 ease-in-out
        ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        max-w-sm w-full backdrop-blur-sm
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <span className="text-lg flex-shrink-0">{styles.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white">{title}</p>
          {message && (
            <p className="text-sm text-gray-300 mt-1">{message}</p>
          )}
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
