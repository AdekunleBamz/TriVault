import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector'

// WalletConnect project ID - get one at https://cloud.walletconnect.com
const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'demo'

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    farcasterMiniApp(),
    injected(),
    coinbaseWallet({ appName: 'TriVault' }),
    walletConnect({ projectId }),
  ],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
