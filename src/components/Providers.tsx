'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/config/wagmi'
import { useState, type ReactNode } from 'react'
import { FrameProvider } from './FrameProvider'
import { ToastProvider } from './ui/ToastProvider'

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <FrameProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </FrameProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
