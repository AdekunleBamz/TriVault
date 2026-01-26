'use client'

import { ReactNode } from 'react'
import { Spinner } from './Spinner'

interface LoadingOverlayProps {
  isLoading: boolean
  children: ReactNode
  message?: string
  blur?: boolean
  fullScreen?: boolean
  className?: string
}

export function LoadingOverlay({
  isLoading,
  children,
  message = 'Loading...',
  blur = true,
  fullScreen = false,
  className = '',
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      
      {isLoading && (
        <div
          className={`
            ${fullScreen ? 'fixed inset-0' : 'absolute inset-0'}
            z-50 flex flex-col items-center justify-center
            bg-gray-950/80
            ${blur ? 'backdrop-blur-sm' : ''}
          `}
        >
          <Spinner size="lg" />
          {message && (
            <p className="mt-4 text-gray-300 text-sm font-medium">{message}</p>
          )}
        </div>
      )}
    </div>
  )
}

interface FullPageLoaderProps {
  message?: string
}

export function FullPageLoader({ message = 'Loading...' }: FullPageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950">
      <Spinner size="lg" />
      {message && (
        <p className="mt-4 text-gray-300 text-sm font-medium">{message}</p>
      )}
    </div>
  )
}

interface ButtonLoaderProps {
  className?: string
}

export function ButtonLoader({ className = '' }: ButtonLoaderProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Spinner size="sm" color="white" />
      <span>Loading...</span>
    </span>
  )
}

interface InlineLoaderProps {
  text?: string
  className?: string
}

export function InlineLoader({ text = 'Loading', className = '' }: InlineLoaderProps) {
  return (
    <span className={`inline-flex items-center gap-2 text-gray-400 ${className}`}>
      <Spinner size="sm" />
      <span>{text}</span>
    </span>
  )
}
