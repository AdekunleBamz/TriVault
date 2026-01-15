import { ConnectButton } from '@/components/ConnectButton'
import { FAQ } from '@/components/FAQ'
import Link from 'next/link'

export const metadata = {
  title: 'FAQ | TriVault',
  description: 'Frequently asked questions about TriVault seal collection on Base blockchain.',
}

export default function FAQPage() {
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
          ❓ Frequently Asked Questions
        </h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Everything you need to know about collecting seals on TriVault.
        </p>
      </section>

      {/* FAQ Content */}
      <main className="max-w-3xl mx-auto px-4 pb-16">
        <FAQ />
      </main>

      {/* Still have questions */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-gray-900 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Still have questions?</h3>
          <p className="text-gray-400 mb-4">
            Reach out to us on Farcaster or check our GitHub repository.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://warpcast.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Farcaster
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Built on Base • Works with Farcaster</p>
        </div>
      </footer>
    </div>
  )
}
