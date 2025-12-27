import { ConnectButton } from "@/components/ConnectButton";
import { VaultGrid } from "@/components/VaultGrid";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔐</span>
            <div>
              <h1 className="text-xl font-bold text-white">TriVault</h1>
              <p className="text-xs text-gray-500">Collect Seals on Base</p>
            </div>
          </div>
          <ConnectButton />
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Collect All 3 Seals
        </h2>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-2">
          Interact with 3 different Base chain contracts to collect your seals.
          Each seal costs only <span className="text-blue-400 font-semibold">0.00001 ETH</span>.
        </p>
        <p className="text-gray-500 text-sm">
          Complete all 3 to become a TriVault champion! ��
        </p>
      </section>

      {/* Vaults */}
      <main className="max-w-6xl mx-auto px-4 pb-16">
        <VaultGrid />
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>Built on Base • Works with Farcaster</p>
          <p className="mt-2">
            Contract:{" "}
            <a
              href="https://basescan.org/address/0xC3319C80FF4fC435ca8827C35A013E64B762ff48"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              0xC331...ff48
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
