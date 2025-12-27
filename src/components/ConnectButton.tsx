'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { useState, useEffect, useCallback } from 'react'
import { useFrame } from './FrameProvider'

export function ConnectButton() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { isInFrame, context } = useFrame()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-connect in Farcaster frame
  useEffect(() => {
    if (isInFrame && !isConnected && connectors.length > 0) {
      // Find the Farcaster connector
      const farcasterConnector = connectors.find(c => c.id === 'farcasterFrame')
      if (farcasterConnector) {
        connect({ connector: farcasterConnector })
      }
    }
  }, [isInFrame, isConnected, connectors, connect])

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium">
        Loading...
      </div>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        {isInFrame && context?.user && (
          <span className="text-sm text-purple-400">
            @{context.user.username}
          </span>
        )}
        <span className="text-sm text-gray-300 bg-gray-800 px-3 py-2 rounded-lg">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        {!isInFrame && (
          <button
            onClick={() => disconnect()}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Disconnect
          </button>
        )}
      </div>
    )
  }

  // In Farcaster frame, show minimal UI
  if (isInFrame) {
    return (
      <div className="text-gray-400 text-sm">
        Connecting...
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      {connectors
        .filter(c => c.id !== 'farcasterFrame') // Hide Farcaster connector outside frame
        .map((connector) => (
          <button
            key={connector.uid}
            onClick={() => connect({ connector })}
            disabled={isPending}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {isPending ? 'Connecting...' : connector.name}
          </button>
        ))}
    </div>
  )
}
