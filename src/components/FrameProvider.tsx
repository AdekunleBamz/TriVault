'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { sdk } from '@farcaster/miniapp-sdk'

// Define our own context type based on what the SDK provides
interface FrameContextData {
  user?: {
    fid?: number
    username?: string
    displayName?: string
    pfpUrl?: string
  }
  // Add other context properties as needed
}

interface FrameContextValue {
  context: FrameContextData | null
  isSDKLoaded: boolean
  isInFrame: boolean
}

const FrameProviderContext = createContext<FrameContextValue>({
  context: null,
  isSDKLoaded: false,
  isInFrame: false,
})

export function useFrame() {
  return useContext(FrameProviderContext)
}

export function FrameProvider({ children }: { children: ReactNode }) {
  const [context, setContext] = useState<FrameContextData | null>(null)
  const [isSDKLoaded, setIsSDKLoaded] = useState(false)
  const [isInFrame, setIsInFrame] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const ctx = await sdk.context
        setContext(ctx)
        setIsInFrame(true)
        
        // Signal to Farcaster that the frame is ready
        sdk.actions.ready()
      } catch (error) {
        // Not in a frame context
        console.log('Not in Farcaster frame context')
        setIsInFrame(false)
      }
      setIsSDKLoaded(true)
    }
    
    load()
  }, [])

  return (
    <FrameProviderContext.Provider value={{ context, isSDKLoaded, isInFrame }}>
      {children}
    </FrameProviderContext.Provider>
  )
}
