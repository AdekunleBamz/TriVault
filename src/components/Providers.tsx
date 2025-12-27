'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/config/wagmi'
import { useState, type ReactNode } from 'react'
import { FrameProvider } from './FrameProvider'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FrameProvider>
          {children}
        </FrameProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
