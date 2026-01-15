import { ConnectButton } from '@/components/ConnectButton'
import Link from 'next/link'

export const metadata = {
  title: 'About | TriVault',
  description: 'Learn how TriVault works - a fun seal collection game on Base blockchain.',
}

export default function AboutPage() {
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

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            About TriVault
          </h2>
          <p className="text-xl text-gray-400">
            A fun on-chain seal collection experience on Base
          </p>
        </div>

        {/* How it Works */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🎮</span> How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <StepCard
              number={1}
              title="Connect Wallet"
              description="Connect your wallet to get started. Works with any Ethereum wallet or directly in Farcaster."
              icon="🔗"
            />
            <StepCard
              number={2}
              title="Collect Seals"
              description="Pay a tiny fee (0.00001 ETH) to interact with each vault and collect your seal."
              icon="✨"
            />
            <StepCard
              number={3}
              title="Complete the Set"
              description="Collect all 3 seals to become a TriVault Champion and join the leaderboard!"
              icon="🏆"
            />
          </div>
        </section>

        {/* The Vaults */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>🔐</span> The Three Vaults
          </h3>
          <div className="space-y-4">
            <VaultInfo
              name="Stability Vault"
              icon="💵"
              description="The first vault represents stability and foundation. Collect this seal to show you value solid fundamentals."
              color="from-blue-500 to-blue-600"
            />
            <VaultInfo
              name="Diamond Vault"
              icon="💎"
              description="The second vault represents value and rarity. Diamond hands collect this seal!"
              color="from-purple-500 to-purple-600"
            />
            <VaultInfo
              name="Bridge Vault"
              icon="🌉"
              description="The third vault represents connection and community. Bridge the gap and complete your collection!"
              color="from-indigo-500 to-indigo-600"
            />
          </div>
        </section>

        {/* Why TriVault */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>💡</span> Why TriVault?
          </h3>
          <div className="bg-gray-900 rounded-2xl p-6 space-y-4">
            <Feature
              title="Fun & Simple"
              description="No complicated mechanics - just collect 3 seals and become a champion!"
            />
            <Feature
              title="Affordable"
              description="Each seal costs only 0.00001 ETH (~$0.003) - accessible to everyone."
            />
            <Feature
              title="On-Chain"
              description="All interactions are recorded on Base blockchain - your seals are yours forever."
            />
            <Feature
              title="Farcaster Native"
              description="Built as a Farcaster mini-app - collect seals without leaving your social feed."
            />
            <Feature
              title="Community"
              description="Join a growing community of seal collectors. Compete on the leaderboard!"
            />
          </div>
        </section>

        {/* Technical Details */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <span>⚙️</span> Technical Details
          </h3>
          <div className="bg-gray-900 rounded-2xl p-6">
            <dl className="space-y-4">
              <TechItem label="Blockchain" value="Base (Ethereum L2)" />
              <TechItem label="Smart Contract" value="Solidity 0.8.20" />
              <TechItem label="Frontend" value="Next.js 14, React, TypeScript" />
              <TechItem label="Web3" value="wagmi, viem" />
              <TechItem label="Integration" value="Farcaster Mini-App SDK" />
            </dl>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Start Collecting?
            </h3>
            <p className="text-blue-100 mb-6">
              Connect your wallet and collect your first seal today!
            </p>
            <Link
              href="/"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              Start Collecting 🔐
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Built on Base • Works with Farcaster</p>
        </div>
      </footer>
    </div>
  )
}

function StepCard({ number, title, description, icon }: { number: number; title: string; description: string; icon: string }) {
  return (
    <div className="bg-gray-900 rounded-xl p-6 text-center">
      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-white font-bold">{number}</span>
      </div>
      <div className="text-3xl mb-3">{icon}</div>
      <h4 className="text-lg font-semibold text-white mb-2">{title}</h4>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  )
}

function VaultInfo({ name, icon, description, color }: { name: string; icon: string; description: string; color: string }) {
  return (
    <div className={`bg-gradient-to-r ${color} p-[1px] rounded-xl`}>
      <div className="bg-gray-900 rounded-xl p-5 flex items-start gap-4">
        <span className="text-4xl">{icon}</span>
        <div>
          <h4 className="text-lg font-semibold text-white mb-1">{name}</h4>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>
    </div>
  )
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-green-500 mt-1">✓</span>
      <div>
        <h4 className="font-semibold text-white">{title}</h4>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
    </div>
  )
}

function TechItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-800 last:border-0">
      <dt className="text-gray-400">{label}</dt>
      <dd className="text-white font-medium">{value}</dd>
    </div>
  )
}
