'use client'

import Link from 'next/link'
import { ConnectButton } from './ConnectButton'
import { Navigation } from './Navigation'

export function Header() {
  return (
    <header className="border-b border-gray-800 sticky top-0 z-40 bg-gray-950/80 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-3xl">🔐</span>
            <div>
              <h1 className="text-xl font-bold text-white">TriVault</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Collect Seals on Base</p>
            </div>
          </Link>
          <Navigation />
        </div>
        <ConnectButton />
      </div>
    </header>
  )
}
