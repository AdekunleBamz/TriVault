'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6">🔐</div>
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <h2 className="text-xl text-gray-300 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist. 
          Maybe it was moved or you mistyped the URL.
        </p>
        <Link href="/">
          <Button size="lg">
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  )
}
