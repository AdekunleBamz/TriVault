'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">😵</div>
        <h1 className="text-3xl font-bold text-white mb-4">Something went wrong!</h1>
        <p className="text-gray-400 mb-8">
          An unexpected error occurred. Don&apos;t worry, our team has been notified.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6 text-left">
            <p className="text-red-400 text-sm font-mono break-all">
              {error.message}
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={reset}>Try Again</Button>
          <Link href="/">
            <Button variant="secondary">Go Home</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
