import { Leaderboard } from '@/components/Leaderboard'
import { ConnectButton } from '@/components/ConnectButton'
import Link from 'next/link'

export const metadata = {
  title: 'Leaderboard | TriVault',
  description: 'See the top seal collectors on TriVault. Compete to climb the ranks!',
}

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <span className="text-3xl">🔐</span>
            <div>
              <h1 className="text-xl font-bold text-white">TriVault</h1>
              <p className="text-xs text-gray-500">Collect Seals on Base</p>
            </div>
          </Link>
          <ConnectButton />
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
          🏆 Leaderboard
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          The top seal collectors ranked by completion time. Be the fastest to collect all 3 seals!
        </p>
      </section>

      {/* Leaderboard Content */}
      <main className="max-w-6xl mx-auto px-4 pb-16">
        <Leaderboard />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Built on Base • Works with Farcaster</p>
        </div>
      </footer>
    </div>
  )
}
